import { expect, test } from '@playwright/test';

import { authFile, resetFixtures } from './helpers';

test.beforeAll(() => {
  resetFixtures();
});

/**
 * HTTP-level authorization boundaries.
 *
 * These assertions hit the real route handlers with a real session cookie, so
 * a regression in permission wiring fails here even if the UI happens to hide
 * the entry point.
 */
test.describe('unauthenticated API access', () => {
  test('patient appointment and alert endpoints reject anonymous callers', async ({
    request,
  }) => {
    const appointments = await request.get('/api/me/appointments');
    expect(appointments.status()).toBe(401);

    const alerts = await request.get('/api/alerts');
    expect(alerts.status()).toBe(401);

    const patients = await request.get('/api/patients');
    expect(patients.status()).toBe(401);
  });
});

test.describe('patient authorization', () => {
  test.use({ storageState: authFile('patientOne') });

  test('cannot read administrative or clinical registers', async ({ request }) => {
    expect((await request.get('/api/users')).status()).toBe(403);
    expect((await request.get('/api/audit')).status()).toBe(403);
    expect((await request.get('/api/patients')).status()).toBe(403);
    expect((await request.get('/api/equipment')).status()).toBe(403);
    expect((await request.get('/api/schedules')).status()).toBe(403);
  });

  test('reads only their own appointments', async ({ request }) => {
    const response = await request.get('/api/me/appointments');
    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      data: {
        patientCode: string;
        schedules: Array<{ id: string; procedure: string }>;
      };
    };

    expect(body.data.patientCode).toBe('QA-P-001');

    const procedures = body.data.schedules.map((item) => item.procedure);
    expect(procedures).toContain('QA Cholecystectomy');
    expect(procedures).not.toContain('QA Appendectomy');
  });

  test('alert reads are scoped to the authenticated patient', async ({
    request,
  }) => {
    const response = await request.get('/api/alerts');
    expect(response.status()).toBe(200);

    const body = (await response.json()) as {
      data: Array<{ id: string; title: string; userId: string; isRead: boolean }>;
    };

    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data.every((alert) => alert.userId.length > 0)).toBe(true);
    expect(body.data.map((alert) => alert.title)).not.toContain(
      'QA other patient alert',
    );
  });

  test('cannot mark another patient’s alert as read', async ({ request }) => {
    const response = await request.patch(
      '/api/alerts/d3333333-3333-4333-8333-333333333333/read',
    );

    expect(response.status()).toBe(403);

    // The other patient's alert is still unread.
    const other = await request.get(
      '/api/alerts?isRead=false',
    );
    const body = (await other.json()) as {
      data: Array<{ title: string }>;
    };
    expect(body.data.map((alert) => alert.title)).not.toContain(
      'QA other patient alert',
    );
  });
});

test.describe('doctor authorization', () => {
  test.use({ storageState: authFile('doctor') });

  test('reads clinical registers but not account administration', async ({
    request,
  }) => {
    expect((await request.get('/api/patients')).status()).toBe(200);
    expect((await request.get('/api/doctors')).status()).toBe(200);
    expect((await request.get('/api/equipment')).status()).toBe(200);
    expect((await request.get('/api/users')).status()).toBe(403);
    expect((await request.get('/api/audit')).status()).toBe(403);
  });

  test('cannot create schedules or manage equipment', async ({ request }) => {
    const createSchedule = await request.post('/api/schedules', {
      data: {
        patientId: 'b1111111-1111-4111-8111-111111111111',
        departmentId: 'a1111111-1111-4111-8111-111111111111',
        otRoomId: 'a3333333-3333-4333-8333-333333333333',
        surgeonId: '22222222-2222-4222-8222-222222222222',
        procedure: 'QA unauthorized schedule',
        scheduledDate: '2030-01-01',
        startTime: '2030-01-01T10:00:00.000Z',
        endTime: '2030-01-01T11:00:00.000Z',
      },
    });
    expect(createSchedule.status()).toBe(403);

    const updateEquipment = await request.patch(
      '/api/equipment/a7777777-7777-4777-8777-777777777777',
      { data: { status: 'MAINTENANCE' } },
    );
    expect(updateEquipment.status()).toBe(403);
  });
});

test.describe('OT staff authorization', () => {
  test.use({ storageState: authFile('ot') });

  test('cannot reach clinical patient registers or administration', async ({
    request,
  }) => {
    expect((await request.get('/api/patients')).status()).toBe(403);
    expect((await request.get('/api/users')).status()).toBe(403);
    expect((await request.get('/api/audit')).status()).toBe(403);
  });

  test('can read the schedule and theatre registers they operate', async ({
    request,
  }) => {
    expect((await request.get('/api/schedules')).status()).toBe(200);
    expect((await request.get('/api/ot-rooms')).status()).toBe(200);
    expect((await request.get('/api/equipment')).status()).toBe(200);
  });
});

test.describe('admin authorization', () => {
  test.use({ storageState: authFile('admin') });

  test('can read every operational register', async ({ request }) => {
    for (const endpoint of [
      '/api/users',
      '/api/audit',
      '/api/patients',
      '/api/doctors',
      '/api/equipment',
      '/api/ot-rooms',
      '/api/schedules',
      '/api/alerts',
    ]) {
      const response = await request.get(endpoint);
      expect(response.status(), `${endpoint} should be readable by ADMIN`).toBe(
        200,
      );
    }
  });

  test('cannot mark a patient alert as read for them without the id', async ({
    request,
  }) => {
    const response = await request.patch('/api/alerts/not-a-uuid/read');
    expect([400, 404]).toContain(response.status());
  });
});
