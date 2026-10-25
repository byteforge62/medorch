'use strict';

/**
 * Runtime authorization and isolation suite for MedOrch.
 *
 * This suite sends real HTTP requests against a running production server
 * (`next start`) backed by a disposable, seeded PostgreSQL database. It
 * authenticates ADMIN, DOCTOR, OT_STAFF, and two PATIENT accounts through
 * the real NextAuth credentials flow and probes authorization boundaries
 * over live HTTP.
 *
 * Do not point this suite at any valuable database. It requires a local
 * `medorch_runtime_test_*` database so it can never accidentally target a
 * development or production database by name.
 *
 * Scope note: today this suite is limited to endpoints that accept an HTTP
 * request carrying the `authjs.session-token` cookie. The MedOrch
 * register/login flow sets a different cookie shape, so the suite does not
 * attempt register/login-driven fake accounts or fresh token creation here.
 * Those paths are covered by the existing register/login tests and by the
 * database-backed permission/read-handler suites.
 */

import { describe, expect, test, beforeAll } from 'vitest';

const DATABASE_URL = process.env.DATABASE_URL ?? '';
const dbUrl = new URL(DATABASE_URL);
const dbPath = dbUrl.pathname.trim('/');

function assertDisposableDatabase() {
  if (
    !DATABASE_URL.startsWith('postgresql://') &&
    !DATABASE_URL.startsWith('postgres://')
  ) {
    throw new Error(
      'DATABASE_URL must be a PostgreSQL connection string for the runtime suite.',
    );
  }

  if (!dbPath.startsWith('medorch_runtime_test_')) {
    throw new Error(
      `DATABASE_URL must target a disposable database whose path starts with 'medorch_runtime_test_'. Current path: '${dbPath}'.`,
    );
  }
}

assertDisposableDatabase();

if (!process.env.NEXT_PUBLIC_APP_URL) {
  throw new Error('NEXT_PUBLIC_APP_URL is required for the runtime suite.');
}

const APP_URL = new URL(process.env.NEXT_PUBLIC_APP_URL);

const CREDENTIALS = {
  admin: { email: 'admin@demo.medorch.local', password: 'DemoPass1!' },
  doctor: { email: 'priya.sharma@demo.medorch.local', password: 'DemoPass1!' },
  otStaff: { email: 'kavya.nurse@demo.medorch.local', password: 'DemoPass1!' },
  patientA: { email: 'aarav.mehta@demo.medorch.local', password: 'DemoPass1!' },
  patientB: { email: 'meera.rao@demo.medorch.local', password: 'DemoPass1!' },
};

type RoleKey = keyof typeof CREDENTIALS;

interface TokenPair {
  csrfToken: string;
  sessionToken: string;
}

async function fetchWithTimeout(
  url: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string | URLSearchParams;
  },
  timeoutMs = 10000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      method: options.method ?? 'GET',
      headers: options.headers,
      body:
        options.body instanceof URLSearchParams
          ? options.body.toString()
          : options.body,
      credentials: 'include',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

async function signInWithCredentials(
  credentials: (typeof CREDENTIALS)[keyof typeof CREDENTIALS],
): Promise<TokenPair> {
  const csrfRes = await fetchWithTimeout(
    `${APP_URL.origin}/api/auth/callback/credentials`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ csrf: 'true' }),
    },
  );

  if (csrfRes.status === 404) {
    // Creds auth may require a path that matches a real NextAuth route.
    // The CSRF handshake remains useful only while the application exposes
    // /api/auth/callback/credentials as a real endpoint.
  }

  if (!csrfRes.ok) {
    throw new Error(
      `CSRF fetch failed: ${csrfRes.status} ${csrfRes.statusText}`,
    );
  }

  const csrfSet = csrfRes.headers
    .getSetCookie()
    .find((c) => c.startsWith('csrfToken='));
  const csrfToken = csrfSet?.split(';')[0].slice('csrfToken='.length) ?? '';

  const body = new URLSearchParams();
  body.set('csrfToken', csrfToken);
  body.set('email', credentials.email);
  body.set('password', credentials.password);

  const loginRes = await fetchWithTimeout(
    `${APP_URL.origin}/api/auth/callback/credentials`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body,
      credentials: 'include',
    },
  );

  if (!loginRes.ok) {
    throw new Error(
      `Credentials login failed for ${credentials.email}: ${loginRes.status} ${loginRes.statusText}`,
    );
  }

  const sessionSet = loginRes.headers
    .getSetCookie()
    .find((c) => c.startsWith('authjs.session-token='));

  if (!sessionSet) {
    throw new Error(`No session cookie returned for ${credentials.email}.`);
  }

  const sessionToken = sessionSet.split(';')[0].slice(
    'authjs.session-token='.length,
  );

  return { csrfToken, sessionToken };
}

async function authenticatedFetch(
  token: string,
  path: string,
  options: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  } = {},
): Promise<Response> {
  return fetchWithTimeout(
    new URL(path, APP_URL.origin).toString(),
    {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `authjs.session-token=${token}`,
        ...options.headers,
      },
      body: options.body,
      credentials: 'include',
    },
  );
}

let serverBaseUrl = '';

function resolveServerBaseUrl(): string {
  const port = Number(process.env.RUNTIME_APP_PORT);
  const pid = Number(process.env.RUNTIME_SERVER_PID);

  if (!port || !pid || pid <= 0) {
    throw new Error(
      'RUNTIME_APP_PORT and RUNTIME_SERVER_PID must be set by the test:runtime script.',
    );
  }

  serverBaseUrl = `http://127.0.0.1:${port}`;
  return serverBaseUrl;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('runtime authorization', () => {
  let tokens: Record<RoleKey, TokenPair>;

  beforeAll(async () => {
    const suiteAppUrl = resolveServerBaseUrl();
    APP_URL.hostname = new URL(suiteAppUrl).hostname;
    APP_URL.port = new URL(suiteAppUrl).port;

    tokens = {} as Record<RoleKey, TokenPair>;

    for (const role of Object.keys(CREDENTIALS) as RoleKey[]) {
      tokens[role] = await signInWithCredentials(CREDENTIALS[role]);
    }
  }, 60_000);

  test('returns 401 for unauthenticated requests on protected endpoints', async () => {
    const endpoints = [
      { method: 'GET' as const, path: '/api/schedules' },
      { method: 'GET' as const, path: '/api/users' },
      { method: 'GET' as const, path: '/api/audit' },
      { method: 'GET' as const, path: '/api/alerts' },
      { method: 'GET' as const, path: '/api/patients' },
      { method: 'GET' as const, path: '/api/departments' },
      { method: 'GET' as const, path: '/api/me/appointments' },
      { method: 'GET' as const, path: '/api/me/staff-schedules' },
      {
        method: 'GET' as const,
        path: '/api/schedules/00000000-0000-0000-0000-000000000001',
      },
      {
        method: 'PATCH' as const,
        path: '/api/schedules/00000000-0000-0000-0000-000000000001/status',
      },
      { method: 'POST' as const, path: '/api/departments' },
    ] as const;

    const results = await Promise.allSettled(
      endpoints.map(({ method, path }) =>
        fetchWithTimeout(
          new URL(path, serverBaseUrl).toString(),
          {
            method,
            headers: { 'Content-Type': 'application/json' },
          },
        ),
      ),
    );

    const failures: string[] = [];

    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      const { method, path } = endpoints[i];

      if (result.status === 'rejected') {
        failures.push(`${method} ${path} rejected: ${result.reason}`);
        continue;
      }

      const response = result.value;
      const body = await response.json().catch(() => ({}));

      if (response.status !== 401) {
        failures.push(
          `${method} ${path}: expected 401, got ${response.status}`,
        );
      } else if (body.success !== false) {
        failures.push(
          `${method} ${path}: expected success:false, got ${JSON.stringify(body)}`,
        );
      } else if (
        !String(body.message ?? '')
          .toLowerCase()
          .includes('unauthorised') &&
        !String(body.message ?? '')
          .toLowerCase()
          .includes('unauthorized')
      ) {
        failures.push(
          `${method} ${path}: expected an 'unauthorised' message, got ${JSON.stringify(body.message)}`,
        );
      }
    }

    expect(failures).toEqual([]);
  });

  test('ADMIN can read protected collections and the audit trail', async () => {
    const adminToken = tokens.admin.sessionToken;

    expect(
      (await authenticatedFetch(adminToken, '/api/schedules', {
        method: 'GET',
      })).status,
    ).toBe(200);
    expect(
      (await authenticatedFetch(adminToken, '/api/users', {
        method: 'GET',
      })).status,
    ).toBe(200);
    expect(
      (await authenticatedFetch(adminToken, '/api/patients', {
        method: 'GET',
      })).status,
    ).toBe(200);
    expect(
      (await authenticatedFetch(adminToken, '/api/departments', {
        method: 'GET',
      })).status,
    ).toBe(200);
    expect(
      (await authenticatedFetch(adminToken, '/api/alerts', {
        method: 'GET',
      })).status,
    ).toBe(200);

    const auditRes = await authenticatedFetch(adminToken, '/api/audit', {
      method: 'GET',
    });
    expect(auditRes.status).toBe(200);

    const auditBody = await auditRes.json();
    expect(auditBody.items).toBeInstanceOf(Array);
    expect(auditBody.pagination).toBeInstanceOf(Object);
  });

  test('ADMIN department lifecycle is mutable and visible to OT_STAFF', async () => {
    const adminToken = tokens.admin.sessionToken;
    const otToken = tokens.otStaff.sessionToken;

    const createRes = await authenticatedFetch(adminToken, '/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Runtime Authorization Test Dept' }),
    });
    expect(createRes.status).toBe(200);

    const created = (await createRes.json()) as { id?: string };
    expect(created.id).toBeDefined();

    const otRes = await authenticatedFetch(otToken, `/api/departments/${created.id}`);
    expect(otRes.status).toBe(200);

    const deleteRes = await authenticatedFetch(
      adminToken,
      `/api/departments/${created.id}`,
      { method: 'DELETE' },
    );
    expect(deleteRes.status).toBe(200);

    const listRes = await authenticatedFetch(adminToken, '/api/departments', {
      method: 'GET',
    });
    expect(listRes.status).toBe(200);

    const listBody =
      (await listRes.json()) as { items?: unknown[] } | unknown[];
    const stillListed = Array.isArray(listBody)
      ? listBody
      : Array.isArray((listBody as { items?: unknown[] }).items)
        ? (listBody as { items: unknown[] }).items
        : [];
    expect(
      stillListed.some(
        (row: unknown) =>
          (typeof row === 'string'
            ? (row as string) === created.id
            : ((row as { id?: unknown }).id as string) === created.id),
      ),
    ).toBe(true);

    await authenticatedFetch(adminToken, `/api/departments/${created.id}/activate`, {
      method: 'POST',
    });
  });

  test('DOCTOR can read permitted resources but cannot mutate admin-only ones', async () => {
    const doctorToken = tokens.doctor.sessionToken;

    const permitted = [
      '/api/schedules',
      '/api/departments',
      '/api/ot-rooms',
      '/api/equipment',
      '/api/patients',
    ] as const;

    for (const path of permitted) {
      const res = await authenticatedFetch(doctorToken, path, { method: 'GET' });
      expect(res.status).toBe(200);
    }

    const forbidden = [
      { path: '/api/audit', method: 'GET' as const },
      { path: '/api/users', method: 'GET' as const },
      { path: '/api/schedules', method: 'POST' as const },
      {
        path: '/api/users/00000000-0000-0000-0000-000000000001/approve',
        method: 'POST' as const,
      },
    ];
    const body = JSON.stringify({});

    for (const { path, method } of forbidden) {
      const res = await authenticatedFetch(doctorToken, path, { method, body });
      expect(res.status).toBe(403);
    }
  });

  test('DOCTOR schedule transitions follow the documented status rules', async () => {
    const doctorToken = tokens.doctor.sessionToken;

    const listRes = await authenticatedFetch(doctorToken, '/api/schedules', {
      method: 'GET',
    });
    expect(listRes.status).toBe(200);

    const schedules = (await listRes.json()) as Array<{
      id: string;
      status: string;
    }>;

    const scheduledId =
      schedules.find((s) => s.status === 'SCHEDULED')?.id ??
      schedules[0]?.id;

    expect(scheduledId).toBeDefined();
    if (!scheduledId) return;

    const invalidRes = await authenticatedFetch(
      doctorToken,
      `/api/schedules/${scheduledId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETED' }),
      },
    );
    expect(invalidRes.status).toBe(409);

    const invalidBody = await invalidRes.json();
    expect(String(invalidBody.message).toLowerCase()).toContain(
      'invalid schedule status transition',
    );

    const validRes = await authenticatedFetch(
      doctorToken,
      `/api/schedules/${scheduledId}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CONFIRMED' }),
      },
    );
    expect(validRes.status).toBe(200);

    const validBody = await validRes.json();
    expect(validBody.status).toBe('CONFIRMED');
  });

  test('OT_STAFF sees only assignment-derived schedules and redacted detail', async () => {
    const otToken = tokens.otStaff.sessionToken;

    const listRes = await authenticatedFetch(otToken, '/api/me/staff-schedules', {
      method: 'GET',
    });
    expect(listRes.status).toBe(200);

    const listBody =
      (await listRes.json()) as { items?: unknown[] } | unknown[];
    const schedules =
      Array.isArray(listBody) ? listBody : (listBody as { items: unknown[] }).items ?? [];
    expect(schedules.length).toBeGreaterThan(0);

    for (const schedule of schedules) {
      expect((schedule as { clinicalNotes?: unknown }).clinicalNotes).toBeNull();
    }

    const firstId =
      (schedules[0] as { id: string }).id ??
      (schedules[0] as { scheduleId?: string }).scheduleId;

    expect(firstId).toBeDefined();
    if (!firstId) return;

    const detailRes = await authenticatedFetch(otToken, `/api/schedules/${firstId}`);
    expect(detailRes.status).toBe(200);

    const detail = await detailRes.json();
    expect((detail as { clinicalNotes?: unknown }).clinicalNotes).toBeNull();

    const patient = detail as {
      patient?: {
        email?: unknown;
        phone?: unknown;
        dateOfBirth?: unknown;
        gender?: unknown;
        name?: unknown;
        patientCode?: unknown;
      };
    };
    expect(patient.patient?.email).toBeNull();
    expect(patient.patient?.phone).toBeNull();
    expect(patient.patient?.dateOfBirth).toBeNull();
    expect(patient.patient?.gender).toBeNull();

    expect(patient.patient?.name).toBeDefined();
    expect(patient.patient?.patientCode).toBeDefined();

    const unassignedRes = await authenticatedFetch(
      otToken,
      '/api/schedules/00000000-0000-0000-0000-000000000001',
    );
    expect(unassignedRes.status).toBe(404);

    const unassignedBody = await unassignedRes.json();
    const message = String(unassignedBody.message ?? '').toLowerCase();
    expect(message).not.toContain('ot staff');
    expect(message).not.toContain('permission');
  });

  test('OT_STAFF cannot mutate schedules, notes, staff, or equipment', async () => {
    const otToken = tokens.otStaff.sessionToken;
    const body = JSON.stringify({});

    const forbidden = [
      {
        path: '/api/schedules/00000000-0000-0000-0000-000000000001/status',
        method: 'PATCH' as const,
      },
      {
        path: '/api/schedules/00000000-0000-0000-0000-000000000001/notes',
        method: 'POST' as const,
      },
      {
        path: '/api/schedules/00000000-0000-0000-0000-000000000001/staff',
        method: 'POST' as const,
      },
      {
        path: '/api/schedules/00000000-0000-0000-0000-000000000001/equipment',
        method: 'POST' as const,
      },
      { path: '/api/schedules', method: 'POST' as const },
      { path: '/api/patients', method: 'GET' as const },
      { path: '/api/users', method: 'GET' as const },
      { path: '/api/audit', method: 'GET' as const },
    ];

    for (const { path, method } of forbidden) {
      const res = await authenticatedFetch(otToken, path, { method, body });
      expect(res.status).toBe(403);
    }
  });

  test('PATIENT can read their own appointments and alerts, not others', async () => {
    const patientAToken = tokens.patientA.sessionToken;
    const patientBToken = tokens.patientB.sessionToken;

    const ownApptsRes = await authenticatedFetch(
      patientAToken,
      '/api/me/appointments',
    );
    expect(ownApptsRes.status).toBe(200);

    const ownAppts = (await ownApptsRes.json()) as Array<{
      id: string;
    }>;
    expect(ownAppts.length).toBeGreaterThan(0);

    const ownId = ownAppts[0].id;

    const ownDetailRes = await authenticatedFetch(
      patientAToken,
      `/api/me/appointments/${ownId}`,
    );
    expect(ownDetailRes.status).toBe(200);

    const foreignDetailRes = await authenticatedFetch(
      patientBToken,
      `/api/me/appointments/${ownId}`,
    );
    expect(foreignDetailRes.status).toBe(404);

    const ownAlertsRes = await authenticatedFetch(
      patientAToken,
      '/api/alerts',
      { method: 'GET' },
    );
    expect(ownAlertsRes.status).toBe(200);

    const body = await ownAlertsRes.json();
    const ownAlerts = (body as { items?: unknown[] }).items ?? [];
    if (ownAlerts.length > 0) {
      const alertId = (ownAlerts[0] as { id: string }).id;

      const updateRes = await authenticatedFetch(
        patientAToken,
        `/api/alerts/${alertId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isRead: true }),
        },
      );
      expect(updateRes.status).toBe(200);

      const deleteRes = await authenticatedFetch(
        patientAToken,
        `/api/alerts/${alertId}`,
        { method: 'DELETE' },
      );
      expect(deleteRes.status).toBe(200);
    }

    if (ownAlerts.length > 0) {
      const alertId = (ownAlerts[0] as { id: string }).id;

      const foreignReadRes = await authenticatedFetch(
        patientBToken,
        `/api/alerts/${alertId}`,
      );
      expect(foreignReadRes.status).toBe(403);

      const foreignUpdateRes = await authenticatedFetch(
        patientBToken,
        `/api/alerts/${alertId}`,
        {
          method: 'PATCH',
          body: JSON.stringify({ isRead: true }),
        },
      );
      expect(foreignUpdateRes.status).toBe(403);

      const foreignDeleteRes = await authenticatedFetch(
        patientBToken,
        `/api/alerts/${alertId}`,
        { method: 'DELETE' },
      );
      expect(foreignDeleteRes.status).toBe(403);
    }
  });

  test('PATIENT cannot reach schedules, users, audit, or me/schedules', async () => {
    const patientToken = tokens.patientA.sessionToken;

    const forbidden = [
      '/api/schedules',
      '/api/users',
      '/api/audit',
      '/api/me/schedules',
      '/api/me/staff-schedules',
    ];

    for (const path of forbidden) {
      const res = await authenticatedFetch(patientToken, path, {
        method: 'GET',
      });
      expect(res.status).toBe(403);
    }
  });

  test('unknown and malformed resource ids are handled without leaking data', async () => {
    const adminToken = tokens.admin.sessionToken;

    const unknownRes = await authenticatedFetch(
      adminToken,
      '/api/schedules/00000000-0000-0000-0000-000000000001',
    );
    expect(unknownRes.status).toBe(404);

    const malformedRes = await authenticatedFetch(
      adminToken,
      '/api/schedules/not-a-uuid',
    );
    expect(malformedRes.status).toBe(400);
  });

  test('schedule status mutations reject invalid transitions and unknown ids', async () => {
    const doctorToken = tokens.doctor.sessionToken;

    const unknownRes = await authenticatedFetch(
      doctorToken,
      '/api/schedules/00000000-0000-0000-0000-000000000001/status',
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'CONFIRMED' }),
      },
    );
    expect(unknownRes.status).toBe(404);

    const listRes = await authenticatedFetch(doctorToken, '/api/schedules', {
      method: 'GET',
    });
    const schedules = (await listRes.json()) as Array<{
      id: string;
      status: string;
    }>;
    const target =
      schedules.find((s) => s.status === 'SCHEDULED') ?? schedules[0];

    expect(target).toBeDefined();
    if (!target) return;

    const invalidRes = await authenticatedFetch(
      doctorToken,
      `/api/schedules/${target.id}/status`,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'COMPLETED' }),
      },
    );
    expect(invalidRes.status).toBe(409);

    const invalidBody = await invalidRes.json();
    expect(String(invalidBody.message).toLowerCase()).toContain(
      'invalid schedule status transition',
    );
  });
});
