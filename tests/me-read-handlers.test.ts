import assert from 'node:assert/strict';
import test from 'node:test';

import { UserRole } from '@/generated/prisma/enums';
import {
  handlePatientAppointments,
  handleStaffSchedules,
} from '@/lib/api/me-read-handlers';

function createSession(role: UserRole, id: string) {
  return {
    user: {
      id,
      role,
    },
  } as Parameters<typeof handleStaffSchedules>[0]['session'];
}

async function readJson(response: Response) {
  return response.json();
}

test('staff schedules: unauthenticated request returns 401', async () => {
  let serviceCalled = false;

  const response = await handleStaffSchedules({
    session: null,
    requestId: 'test-unauth-staff',
    getData: async () => {
      serviceCalled = true;
      return [];
    },
  });

  assert.equal(response?.status, 401);
  assert.equal(serviceCalled, false);
});

test('staff schedules: non-OT staff role returns 403', async () => {
  let serviceCalled = false;

  const response = await handleStaffSchedules({
    session: createSession(UserRole.DOCTOR, 'doctor-1'),
    requestId: 'test-forbidden-staff',
    getData: async () => {
      serviceCalled = true;
      return [];
    },
  });

  assert.equal(response?.status, 403);
  assert.equal(serviceCalled, false);
});

test("staff schedules: passes the authenticated user's ID to the service", async () => {
  let receivedUserId = '';

  const response = await handleStaffSchedules({
    session: createSession(UserRole.OT_STAFF, 'staff-123'),
    requestId: 'test-staff-owner',
    getData: async (userId) => {
      receivedUserId = userId;
      return [{ id: 'schedule-1' }];
    },
  });

  assert.equal(response?.status, 200);
  assert.equal(receivedUserId, 'staff-123');

  const body = await readJson(response!);
  assert.deepEqual(body.data, [{ id: 'schedule-1' }]);
});

test('patient appointments: unauthenticated request returns 401', async () => {
  let serviceCalled = false;

  const response = await handlePatientAppointments({
    session: null,
    requestId: 'test-unauth-patient',
    getData: async () => {
      serviceCalled = true;
      return { appointments: [] };
    },
  });

  assert.equal(response?.status, 401);
  assert.equal(serviceCalled, false);
});

test('patient appointments: non-patient role returns 403', async () => {
  let serviceCalled = false;

  const response = await handlePatientAppointments({
    session: createSession(UserRole.DOCTOR, 'doctor-2'),
    requestId: 'test-forbidden-patient',
    getData: async () => {
      serviceCalled = true;
      return { appointments: [] };
    },
  });

  assert.equal(response?.status, 403);
  assert.equal(serviceCalled, false);
});

test("patient appointments: passes the authenticated user's ID to the service", async () => {
  let receivedUserId = '';

  const response = await handlePatientAppointments({
    session: createSession(UserRole.PATIENT, 'patient-user-123'),
    requestId: 'test-patient-owner',
    getData: async (userId) => {
      receivedUserId = userId;
      return {
        id: 'patient-record-1',
        appointments: [{ id: 'appointment-1' }],
      };
    },
  });

  assert.equal(response?.status, 200);
  assert.equal(receivedUserId, 'patient-user-123');

  const body = await readJson(response!);
  assert.equal(body.data.id, 'patient-record-1');
  assert.deepEqual(body.data.appointments, [{ id: 'appointment-1' }]);
  assert.equal(typeof body.data.currentTime, 'number');
});

test('patient appointments: missing patient record returns 404', async () => {
  const response = await handlePatientAppointments({
    session: createSession(UserRole.PATIENT, 'unlinked-patient'),
    requestId: 'test-unlinked-patient',
    getData: async () => null,
  });

  assert.equal(response?.status, 404);
});

test('staff schedules: service failure returns 500 without leaking the error', async () => {
  const response = await handleStaffSchedules({
    session: createSession(UserRole.OT_STAFF, 'staff-error'),
    requestId: 'test-staff-error',
    getData: async () => {
      throw new Error('synthetic database failure');
    },
  });

  assert.equal(response?.status, 500);

  const body = await readJson(response!);
  assert.equal(body.message, 'Failed to fetch your staff assignments.');
  assert.equal(
    JSON.stringify(body).includes('synthetic database failure'),
    false,
  );
});

test('patient appointments: service failure returns 500 without leaking the error', async () => {
  const response = await handlePatientAppointments({
    session: createSession(UserRole.PATIENT, 'patient-error'),
    requestId: 'test-patient-error',
    getData: async () => {
      throw new Error('synthetic database failure');
    },
  });

  assert.equal(response?.status, 500);

  const body = await readJson(response!);
  assert.equal(body.message, 'Failed to fetch patient appointments.');
  assert.equal(
    JSON.stringify(body).includes('synthetic database failure'),
    false,
  );
});
