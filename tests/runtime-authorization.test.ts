/**
 * Phase 5 — live HTTP authorization and isolation tests.
 *
 * Sends real HTTP requests against a production server (`next start`) backed
 * by a disposable, synthetic database. Requirements (both asserted below):
 *
 *   1. DATABASE_URL points at a local disposable database named
 *      medorch_runtime_test_* (same guard style as the alerts suite).
 *   2. A current production build exists (`.next/BUILD_ID`).
 *
 * The suite spawns the server itself, authenticates each role through the real
 * NextAuth credentials flow (no bypass, no backdoor), exercises the documented
 * role/ownership/redaction boundaries, then tears the server down. Expected
 * statuses are derived from `src/lib/auth/permission.ts`, the route handlers,
 * and the service-level ownership checks — not invented for the tests.
 */

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { spawn, spawnSync, type ChildProcess } from "node:child_process";
import { existsSync } from "node:fs";
import { createServer } from "node:net";
import test, { after, before } from "node:test";
import { setTimeout as delay } from "node:timers/promises";

import { DEMO_SEED_CONFIG } from "../prisma/demo-data";

type Dict = Record<string, unknown>;

type ApiJson = {
  success?: unknown;
  message?: unknown;
  data?: unknown;
};

type ApiResponse = { status: number; body: ApiJson };

type Jar = Map<string, string>;

type Account = {
  email: string;
  password: string;
  jar: Jar;
};

// ---------------------------------------------------------------------------
// Environment guards
// ---------------------------------------------------------------------------

const connectionString = process.env.DATABASE_URL;
assert.ok(connectionString, "DATABASE_URL must be configured.");

const databaseUrl = new URL(connectionString);
const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));
assert.ok(
  ["localhost", "127.0.0.1", "[::1]"].includes(databaseUrl.hostname) &&
    /^medorch_runtime_test_[a-z0-9]+$/.test(databaseName),
  "Runtime authorization tests require a disposable local medorch_runtime_test_* database.",
);

// ---------------------------------------------------------------------------
// Small assertion/narrowing helpers (no `any`, no secrets in messages)
// ---------------------------------------------------------------------------

function asArray(value: unknown, label: string): unknown[] {
  assert.ok(Array.isArray(value), `${label} should be an array`);
  return value;
}

function asObject(value: unknown, label: string): Dict {
  assert.ok(
    value !== null && typeof value === "object" && !Array.isArray(value),
    `${label} should be an object`,
  );
  return value as Dict;
}

function asId(value: unknown, label: string): string {
  assert.equal(typeof value, "string", `${label} should be a string id`);
  return value as string;
}

// ---------------------------------------------------------------------------
// HTTP helpers
// ---------------------------------------------------------------------------

let base = "";

function applySetCookies(jar: Jar, response: Response): void {
  for (const raw of response.headers.getSetCookie()) {
    const [pair] = raw.split(";");
    const separator = pair.indexOf("=");
    if (separator < 0) continue;
    const name = pair.slice(0, separator).trim();
    const value = pair.slice(separator + 1).trim();
    if (value === "") {
      jar.delete(name);
    } else {
      jar.set(name, value);
    }
  }
}

function cookieHeader(jar: Jar): string {
  return [...jar].map(([name, value]) => `${name}=${value}`).join("; ");
}

async function request(
  method: string,
  path: string,
  jar?: Jar,
  body?: unknown,
): Promise<ApiResponse> {
  const response = await fetch(`${base}${path}`, {
    method,
    redirect: "manual",
    headers: {
      ...(jar ? { cookie: cookieHeader(jar) } : {}),
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  let parsed: ApiJson = {};
  try {
    parsed = (await response.json()) as ApiJson;
  } catch {
    parsed = {};
  }

  return { status: response.status, body: parsed };
}

const get = (path: string, jar?: Jar) => request("GET", path, jar);
const post = (path: string, jar?: Jar, body?: unknown) =>
  request("POST", path, jar, body);
const patch = (path: string, jar?: Jar, body?: unknown) =>
  request("PATCH", path, jar, body);
const del = (path: string, jar?: Jar) => request("DELETE", path, jar);

/**
 * Logs in through the real NextAuth credentials flow (CSRF token + callback)
 * and returns the resulting cookie jar. Failure messages never include cookie
 * or token values.
 */
async function login(email: string, password: string): Promise<Jar> {
  const jar: Jar = new Map();

  const csrfResponse = await fetch(`${base}/api/auth/csrf`, {
    headers: { cookie: "" },
  });
  applySetCookies(jar, csrfResponse);

  const csrfBody = (await csrfResponse.json()) as { csrfToken?: string };
  assert.ok(csrfResponse.ok && csrfBody.csrfToken, `CSRF fetch failed (${csrfResponse.status})`);

  const callbackResponse = await fetch(`${base}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "content-type": "application/x-www-form-urlencoded",
      accept: "application/json",
      cookie: cookieHeader(jar),
    },
    body: new URLSearchParams({
      csrfToken: csrfBody.csrfToken,
      email,
      password,
    }).toString(),
  });
  applySetCookies(jar, callbackResponse);

  const hasSession = [...jar.keys()].some((name) => name.includes("session-token"));
  assert.ok(
    hasSession,
    `Login failed for ${email} (HTTP ${callbackResponse.status})`,
  );

  return jar;
}

// ---------------------------------------------------------------------------
// Server lifecycle
// ---------------------------------------------------------------------------

let server: ChildProcess | undefined;
let serverOutput = "";

function freePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const probe = createServer();
    probe.on("error", reject);
    probe.listen(0, "127.0.0.1", () => {
      const address = probe.address();
      if (address === null || typeof address === "string") {
        probe.close(() => reject(new Error("Could not allocate a port.")));
        return;
      }
      const { port } = address;
      probe.close(() => resolve(port));
    });
  });
}

async function waitForServer(timeoutMs = 60_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  let lastStatus = "no response";

  while (Date.now() < deadline) {
    if (server && server.exitCode !== null) {
      throw new Error(
        `Server exited early (code ${server.exitCode}): ${serverOutput.slice(-2000)}`,
      );
    }
    try {
      const response = await fetch(`${base}/login`);
      if (response.status === 200) return;
      lastStatus = `HTTP ${response.status}`;
    } catch (error) {
      lastStatus = error instanceof Error ? error.message : String(error);
    }
    await delay(250);
  }

  throw new Error(
    `Server not ready within ${timeoutMs}ms (${lastStatus}): ${serverOutput.slice(-2000)}`,
  );
}

async function stopServer(): Promise<void> {
  if (!server || server.exitCode !== null) {
    assert.equal(
      await isPortClosed(),
      true,
      "Server port still accepting connections after exit.",
    );
    return;
  }

  const exited = new Promise<void>((resolve) => {
    server?.once("exit", () => resolve());
  });
  server.kill();
  const settled = await Promise.race([
    exited.then(() => true),
    delay(5000).then(() => false),
  ]);
  if (!settled && server.exitCode === null && server.pid !== undefined) {
    spawnSync("taskkill", ["/pid", String(server.pid), "/t", "/f"]);
    await Promise.race([exited, delay(3000)]);
  }

  assert.equal(
    await isPortClosed(),
    true,
    "Server port is still accepting connections after shutdown.",
  );
}

async function isPortClosed(): Promise<boolean> {
  if (!base) return true;
  try {
    const response = await fetch(`${base}/login`, {
      signal: AbortSignal.timeout(1000),
    });
    return response.status === 0;
  } catch {
    return true;
  }
}

// ---------------------------------------------------------------------------
// Fixtures (discovered from the live API, no hardcoded record ids)
// ---------------------------------------------------------------------------

const runId = randomUUID().replaceAll("-", "").slice(0, 12);
const nilId = "00000000-0000-0000-0000-000000000000";

const cfg = DEMO_SEED_CONFIG;

function pickAccount(role: string): { email: string; password: string } {
  const user = cfg.users.find((u) => u.role === role && u.status === "ACTIVE");
  assert.ok(user, `Demo seed config has no ACTIVE ${role} account.`);
  return {
    email: user.email,
    password: role === "ADMIN" ? cfg.passwords.admin : cfg.passwords.demo,
  };
}

const adminAcct = pickAccount("ADMIN");
const doctorAcct = pickAccount("DOCTOR");
const otAcct = pickAccount("OT_STAFF");
const patientAccounts = cfg.users.filter(
  (u) => u.role === "PATIENT" && u.status === "ACTIVE",
);
assert.ok(
  patientAccounts.length >= 2,
  "Demo seed config needs at least two ACTIVE PATIENT accounts.",
);
const patientAAccount = {
  email: patientAccounts[0].email,
  password: cfg.passwords.demo,
};
const patientBAccount = {
  email: patientAccounts[1].email,
  password: cfg.passwords.demo,
};
const patientAName = patientAccounts[0].name;
const patientBName = patientAccounts[1].name;

let admin: Account;
let doctor: Account;
let ot: Account;
let patientA: Account;
let patientB: Account;

const probeIds: string[] = [];
let assignedIds: string[] = [];
let unassignedId = "";
let patientAUserId = "";
let patientBUserId = "";
let doctorUserId = "";
let probeTitle = "";
let probeAlertId = "";

before(async () => {
  assert.ok(
    existsSync(".next/BUILD_ID"),
    "Production build missing — run `npm run build` before `npm run test:runtime`.",
  );

  const port = await freePort();
  base = `http://127.0.0.1:${port}`;

  server = spawn(
    process.execPath,
    [
      "node_modules/next/dist/bin/next",
      "start",
      "--port",
      String(port),
      "--hostname",
      "127.0.0.1",
    ],
    {
      env: { ...process.env, AUTH_TRUST_HOST: "true" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  server.stdout?.on("data", (chunk: Buffer) => {
    serverOutput += chunk.toString();
  });
  server.stderr?.on("data", (chunk: Buffer) => {
    serverOutput += chunk.toString();
  });

  await waitForServer();

  admin = { ...adminAcct, jar: await login(adminAcct.email, adminAcct.password) };
  doctor = { ...doctorAcct, jar: await login(doctorAcct.email, doctorAcct.password) };
  ot = { ...otAcct, jar: await login(otAcct.email, otAcct.password) };
  patientA = {
    ...patientAAccount,
    jar: await login(patientAAccount.email, patientAAccount.password),
  };
  patientB = {
    ...patientBAccount,
    jar: await login(patientBAccount.email, patientBAccount.password),
  };

  // Discover fixtures from the live API as ADMIN.
  const scheduleList = asArray(
    (await get("/api/schedules", admin.jar)).body.data,
    "admin schedule list",
  ).map((item) => asObject(item, "schedule"));

  const assignments = asArray(
    (await get("/api/me/staff-schedules", ot.jar)).body.data,
    "ot assignments",
  );
  assignedIds = assignments.map((item) =>
    asId(asObject(asObject(item, "assignment").schedule, "assignment.schedule").id, "assigned schedule id"),
  );
  assert.ok(assignedIds.length >= 1, "Seed must assign schedules to OT staff.");

  const unassigned = scheduleList.find(
    (item) => !assignedIds.includes(asId(item.id, "schedule id")),
  );
  assert.ok(unassigned, "Seed must contain a schedule the OT staff account is not assigned to.");
  unassignedId = asId(unassigned.id, "unassigned schedule id");

  const users = asArray(
    (await get("/api/users", admin.jar)).body.data,
    "admin user list",
  ).map((item) => asObject(item, "user"));
  const idByEmail = (email: string): string => {
    const match = users.find((user) => user.email === email);
    assert.ok(match, `No seeded user for ${email}.`);
    return asId(match.id, "user id");
  };
  patientAUserId = idByEmail(patientAAccount.email);
  patientBUserId = idByEmail(patientBAccount.email);
  doctorUserId = idByEmail(doctorAcct.email);

  // Transition probes: created fresh on every run so the status-transition
  // tests never depend on leftover seed state. Each probe uses a future date
  // on which no schedule exists at all, so overlap constraints cannot fire.
  const departments = asArray(
    (await get("/api/departments", admin.jar)).body.data,
    "department list",
  ).map((item) => asObject(item, "department"));
  const rooms = asArray(
    (await get("/api/ot-rooms", admin.jar)).body.data,
    "ot room list",
  ).map((item) => asObject(item, "ot room"));

  let departmentId = "";
  let roomId = "";
  for (const department of departments) {
    if (department.isActive === false) continue;
    const room = rooms.find(
      (candidate) =>
        candidate.departmentId === department.id &&
        candidate.status === "AVAILABLE" &&
        candidate.isActive !== false,
    );
    if (room) {
      departmentId = asId(department.id, "department id");
      roomId = asId(room.id, "ot room id");
      break;
    }
  }
  assert.ok(
    departmentId && roomId,
    "Seed must provide an active department with an available OT room.",
  );

  const patients = asArray(
    (await get("/api/patients", admin.jar)).body.data,
    "patient list",
  ).map((item) => asObject(item, "patient"));
  const patientARecord = patients.find((item) => {
    const linkedUser = item.user;
    if (linkedUser === null || typeof linkedUser !== "object") return false;
    return (linkedUser as Dict).email === patientAAccount.email;
  });
  assert.ok(patientARecord, "Patient A record must exist in the registry.");
  const patientRecordId = asId(patientARecord.id, "patient record id");

  const usedDates = new Set(
    scheduleList.map((item) => String(item.scheduledDate ?? "").slice(0, 10)),
  );
  const freeDayFrom = (startMs: number): string => {
    for (let day = 0; day < 60; day += 1) {
      const iso = new Date(startMs + day * 86_400_000).toISOString().slice(0, 10);
      if (!usedDates.has(iso)) {
        usedDates.add(iso);
        return iso;
      }
    }
    throw new Error("No free schedule date available for probe fixtures.");
  };

  const probeDates = [
    freeDayFrom(Date.now() + 400 * 86_400_000),
    freeDayFrom(Date.now() + 401 * 86_400_000),
  ];

  for (const [index, date] of probeDates.entries()) {
    const created = await post("/api/schedules", admin.jar, {
      patientId: patientRecordId,
      departmentId,
      otRoomId: roomId,
      surgeonId: doctorUserId,
      procedure: `Phase 5 transition probe ${index + 1} ${runId}`,
      scheduledDate: date,
      startTime: `${date}T09:00:00.000Z`,
      endTime: `${date}T10:00:00.000Z`,
    });
    assert.equal(
      created.status,
      200,
      `probe schedule ${index + 1} should be created with 200 for ADMIN`,
    );
    const probe = asObject(created.body.data, "probe schedule");
    assert.equal(probe.status, "SCHEDULED", "probe schedule starts SCHEDULED");
    probeIds.push(asId(probe.id, "probe schedule id"));
  }

  probeTitle = `Phase 5 isolation probe ${runId}`;
  const created = await post(
    "/api/alerts",
    admin.jar,
    {
      userId: patientAUserId,
      type: "SYSTEM",
      title: probeTitle,
      message: "Synthetic Phase 5 cross-account isolation probe.",
    },
  );
  assert.equal(created.status, 200, "admin alert creation should succeed");
  probeAlertId = asId(asObject(created.body.data, "created alert").id, "alert id");
});

after(async () => {
  await stopServer();
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test("unauthenticated requests to protected endpoints return 401", async () => {
  const cases: Array<[string, string, unknown?]> = [
    ["GET", "/api/schedules"],
    ["GET", "/api/users"],
    ["GET", "/api/audit"],
    ["GET", "/api/alerts"],
    ["GET", "/api/patients"],
    ["GET", "/api/departments"],
    ["GET", "/api/me/appointments"],
    ["GET", "/api/me/staff-schedules"],
    ["GET", `/api/schedules/${probeIds[0]}`],
    ["PATCH", `/api/schedules/${probeIds[0]}/status`, { status: "CONFIRMED" }],
    ["POST", "/api/departments", { name: `Unauthenticated probe ${runId}` }],
    ["POST", "/api/alerts", { userId: patientAUserId, type: "SYSTEM", title: "x", message: "y" }],
  ];

  for (const [method, path, body] of cases) {
    const response = await request(method, path, undefined, body);
    assert.equal(response.status, 401, `${method} ${path} should be 401`);
    assert.equal(response.body.success, false, `${method} ${path} envelope`);
    assert.equal(response.body.message, "Unauthorized", `${method} ${path} message`);
  }
});

test("ADMIN can read protected collections including the audit log", async () => {
  for (const path of ["/api/schedules", "/api/users", "/api/patients", "/api/departments", "/api/alerts"]) {
    const response = await get(path, admin.jar);
    assert.equal(response.status, 200, `${path} should be 200 for ADMIN`);
    assert.equal(response.body.success, true, `${path} envelope`);
  }

  const audit = await get("/api/audit", admin.jar);
  assert.equal(audit.status, 200, "/api/audit should be 200 for ADMIN");
  const auditData = asObject(audit.body.data, "audit payload");
  asArray(auditData.items, "audit items");
  asObject(auditData.pagination, "audit pagination");
});

test("ADMIN department lifecycle mutation works and is visible to readers", async () => {
  const departmentName = `Runtime Probe ${runId}`;
  const created = await post("/api/departments", admin.jar, {
    name: departmentName,
  });
  assert.equal(created.status, 200, "department create should be 200 for ADMIN");
  const departmentId = asId(asObject(created.body.data, "department").id, "department id");

  const asReader = await get("/api/departments", ot.jar);
  assert.equal(asReader.status, 200, "department list should be 200 for OT_STAFF");
  const readerNames = asArray(asReader.body.data, "ot department list")
    .map((item) => asObject(item, "department"))
    .map((item) => item.name);
  assert.ok(
    readerNames.includes(departmentName),
    "created department should be visible to OT_STAFF readers",
  );

  // DELETE /api/departments/{id} is documented as a soft delete
  // (deactivateDepartment): the record stays listed but inactive.
  const removed = await del(`/api/departments/${departmentId}`, admin.jar);
  assert.equal(removed.status, 200, "department delete should be 200 for ADMIN");
  assert.equal(
    asObject(removed.body.data, "removed department").isActive,
    false,
    "DELETE deactivates the department",
  );

  const afterRemoval = await get("/api/departments", ot.jar);
  const stillListed = asArray(afterRemoval.body.data, "ot department list")
    .map((item) => asObject(item, "department"))
    .find((item) => item.id === departmentId);
  assert.ok(stillListed, "soft-deleted department remains listed");
  assert.equal(
    stillListed.isActive,
    false,
    "soft-deleted department is inactive",
  );
});

test("DOCTOR gets expected 200/403 across role boundaries", async () => {
  const allowed = ["/api/schedules", "/api/patients", "/api/me/schedules", "/api/departments", "/api/alerts"];
  for (const path of allowed) {
    const response = await get(path, doctor.jar);
    assert.equal(response.status, 200, `${path} should be 200 for DOCTOR`);
  }

  const forbidden: Array<[string, string, unknown?]> = [
    ["GET", "/api/audit"],
    ["GET", "/api/users"],
    ["POST", "/api/schedules", { patientId: nilId }],
    ["POST", `/api/users/${patientAUserId}/approve`],
  ];
  for (const [method, path, body] of forbidden) {
    const response = await request(method, path, doctor.jar, body);
    assert.equal(response.status, 403, `${method} ${path} should be 403 for DOCTOR`);
    assert.equal(response.body.success, false, `${method} ${path} envelope`);
  }
});

test("DOCTOR schedule transitions: valid transition succeeds, invalid returns 409", async () => {
  const invalid = await patch(
    `/api/schedules/${probeIds[0]}/status`,
    doctor.jar,
    { status: "COMPLETED" },
  );
  assert.equal(invalid.status, 409, "SCHEDULED → COMPLETED must be rejected");
  assert.equal(invalid.body.message, "Invalid schedule status transition.");

  const valid = await patch(
    `/api/schedules/${probeIds[1]}/status`,
    doctor.jar,
    { status: "CONFIRMED" },
  );
  assert.equal(valid.status, 200, "SCHEDULED → CONFIRMED must succeed for DOCTOR");
  assert.equal(
    asObject(valid.body.data, "updated schedule").status,
    "CONFIRMED",
    "updated schedule status",
  );
});

test("OT_STAFF schedule list is assignment-scoped with clinical notes nulled", async () => {
  const response = await get("/api/schedules", ot.jar);
  assert.equal(response.status, 200, "schedule list should be 200 for OT_STAFF");

  const schedules = asArray(response.body.data, "ot schedule list").map((item) =>
    asObject(item, "ot schedule"),
  );
  assert.ok(schedules.length >= 1, "OT_STAFF should see assigned schedules");
  for (const schedule of schedules) {
    assert.ok(
      assignedIds.includes(asId(schedule.id, "schedule id")),
      "OT_STAFF list must contain only assigned schedules",
    );
    assert.equal(schedule.clinicalNotes, null, "clinicalNotes must be nulled for OT_STAFF");
  }
});

test("OT_STAFF schedule detail is assignment-scoped and redacts patient phone", async () => {
  const assigned = await get(`/api/schedules/${assignedIds[0]}`, ot.jar);
  assert.equal(assigned.status, 200, "assigned schedule detail should be 200 for OT_STAFF");

  const detail = asObject(assigned.body.data, "schedule detail");
  assert.equal(detail.clinicalNotes, null, "clinicalNotes must be nulled");
  const patient = asObject(detail.patient, "schedule patient");
  assert.ok(patient.name, "OT_STAFF keeps the patient name");
  assert.ok(patient.patientCode, "OT_STAFF keeps the patient code");
  assert.equal(patient.email, null, "patient email must be redacted");
  assert.equal(patient.phone, null, "patient phone must be redacted");
  assert.equal(patient.dateOfBirth, null, "patient dateOfBirth must be redacted");
  assert.equal(patient.gender, null, "patient gender must be redacted");

  const unassigned = await get(`/api/schedules/${unassignedId}`, ot.jar);
  assert.equal(unassigned.status, 404, "unassigned schedule must be a non-disclosing 404");
  assert.equal(unassigned.body.message, "Schedule not found.");

  const unassignedStaff = await get(`/api/schedules/${unassignedId}/staff`, ot.jar);
  assert.equal(unassignedStaff.status, 404, "unassigned staff sub-resource must be 404");

  const unassignedEquipment = await get(`/api/schedules/${unassignedId}/equipment`, ot.jar);
  assert.equal(unassignedEquipment.status, 404, "unassigned equipment sub-resource must be 404");
});

test("OT_STAFF gets 403 on admin surfaces and mutation endpoints", async () => {
  const forbidden: Array<[string, string, unknown?]> = [
    ["GET", "/api/patients"],
    ["GET", "/api/users"],
    ["GET", "/api/audit"],
    ["GET", `/api/patients/${patientAUserId}`],
    ["GET", "/api/me/schedules"],
    ["GET", `/api/schedules/${assignedIds[0]}/notes`],
    ["POST", "/api/schedules", { patientId: patientAUserId }],
    ["PATCH", `/api/schedules/${assignedIds[0]}/status`, { status: "CONFIRMED" }],
    ["POST", `/api/schedules/${assignedIds[0]}/notes`, { content: "probe" }],
    ["POST", `/api/schedules/${assignedIds[0]}/staff`, { userId: doctorUserId }],
    ["POST", `/api/users/${patientAUserId}/approve`],
  ];

  for (const [method, path, body] of forbidden) {
    const response = await request(method, path, ot.jar, body);
    assert.equal(response.status, 403, `${method} ${path} should be 403 for OT_STAFF`);
    assert.equal(response.body.success, false, `${method} ${path} envelope`);
  }

  const roleDenied = await get("/api/me/schedules", ot.jar);
  assert.equal(roleDenied.status, 403, "/api/me/schedules role check");
  assert.equal(
    roleDenied.body.message,
    "Only doctor accounts can access this schedule.",
    "doctor-only endpoint message for OT_STAFF",
  );

  for (const path of ["/api/departments", "/api/ot-rooms", "/api/equipment", "/api/doctors", "/api/me/staff-schedules", "/api/alerts"]) {
    const response = await get(path, ot.jar);
    assert.equal(response.status, 200, `${path} should be 200 for OT_STAFF`);
  }
});

test("PATIENT appointment data is isolated to the signed-in account", async () => {
  const ownA = await get("/api/me/appointments", patientA.jar);
  assert.equal(ownA.status, 200, "patient appointments should be 200");
  const portalA = asObject(ownA.body.data, "patient A portal");
  assert.equal(portalA.name, patientAName, "portal returns the signed-in patient's record");
  const textA = JSON.stringify(ownA.body);
  assert.ok(textA.includes(patientAName), "own name present");
  assert.ok(!textA.includes(patientBName), "foreign patient name must not appear");

  const ownB = await get("/api/me/appointments", patientB.jar);
  assert.equal(ownB.status, 200, "second patient appointments should be 200");
  const textB = JSON.stringify(ownB.body);
  const portalB = asObject(ownB.body.data, "patient B portal");
  assert.equal(portalB.name, patientBName, "portal returns the signed-in patient's record");
  assert.ok(textB.includes(patientBName), "own name present");
  assert.ok(!textB.includes(patientAName), "foreign patient name must not appear");
  assert.notEqual(portalA.id, portalB.id, "distinct patient records");
});

test("PATIENT is denied every non-owned surface", async () => {
  const forbidden: Array<[string, string, unknown?]> = [
    ["GET", "/api/schedules"],
    ["GET", `/api/schedules/${probeIds[0]}`],
    ["GET", "/api/patients"],
    ["GET", `/api/patients/${nilId}`],
    ["GET", "/api/users"],
    ["GET", "/api/audit"],
    ["GET", "/api/me/schedules"],
    ["GET", "/api/me/staff-schedules"],
    ["POST", "/api/schedules", { patientId: patientAUserId }],
    ["PATCH", `/api/schedules/${probeIds[0]}/status`, { status: "CANCELLED" }],
    ["POST", "/api/departments", { name: `Patient probe ${runId}` }],
    ["POST", "/api/alerts", { userId: patientBUserId, type: "SYSTEM", title: "x", message: "y" }],
  ];

  for (const [method, path, body] of forbidden) {
    const response = await request(method, path, patientA.jar, body);
    assert.equal(response.status, 403, `${method} ${path} should be 403 for PATIENT`);
    assert.equal(response.body.success, false, `${method} ${path} envelope`);
  }
});

test("PATIENT alert ownership: cross-account read and mutation are blocked", async () => {
  const listA = await get("/api/alerts", patientA.jar);
  assert.equal(listA.status, 200, "own alert list should be 200");
  const titlesA = asArray(listA.body.data, "patient A alerts")
    .map((item) => asObject(item, "alert"))
    .map((item) => item.title);
  assert.ok(titlesA.includes(probeTitle), "patient A sees the alert targeted at them");

  const listB = await get("/api/alerts", patientB.jar);
  assert.equal(listB.status, 200, "own alert list should be 200");
  const titlesB = asArray(listB.body.data, "patient B alerts")
    .map((item) => asObject(item, "alert"))
    .map((item) => item.title);
  assert.ok(
    !titlesB.includes(probeTitle),
    "patient B must not see alerts targeted at patient A",
  );

  const foreignRead = await get(`/api/alerts/${probeAlertId}`, patientB.jar);
  assert.equal(foreignRead.status, 403, "foreign alert read must be 403");
  assert.equal(
    foreignRead.body.message,
    "You do not have permission to view this alert.",
  );

  const foreignUpdate = await patch(`/api/alerts/${probeAlertId}`, patientB.jar, {
    isRead: true,
  });
  assert.equal(foreignUpdate.status, 403, "foreign alert update must be 403");
  assert.equal(
    foreignUpdate.body.message,
    "You do not have permission to update this alert.",
  );

  const foreignDelete = await del(`/api/alerts/${probeAlertId}`, patientB.jar);
  assert.equal(foreignDelete.status, 403, "foreign alert delete must be 403");
  assert.equal(foreignDelete.body.success, false);

  const ownUpdate = await patch(`/api/alerts/${probeAlertId}`, patientA.jar, {
    isRead: true,
  });
  assert.equal(ownUpdate.status, 200, "owner may update their own alert");
  assert.equal(
    asObject(ownUpdate.body.data, "updated alert").isRead,
    true,
    "alert marked read",
  );
});

test("resource-id manipulation yields non-disclosing 404/400 responses", async () => {
  const missingSchedule = await get(`/api/schedules/${nilId}`, admin.jar);
  assert.equal(missingSchedule.status, 404, "unknown schedule id as ADMIN");
  assert.equal(missingSchedule.body.message, "Schedule not found.");

  const missingAsOt = await get(`/api/schedules/${nilId}`, ot.jar);
  assert.equal(missingAsOt.status, 404, "unknown schedule id as OT_STAFF");
  assert.equal(missingAsOt.body.message, "Schedule not found.");

  const malformed = await get("/api/schedules/not-a-uuid", admin.jar);
  assert.equal(malformed.status, 400, "malformed schedule id");

  const missingStatus = await patch(`/api/schedules/${nilId}/status`, admin.jar, {
    status: "CONFIRMED",
  });
  assert.equal(missingStatus.status, 404, "status update on unknown schedule id");

  const missingAlert = await get(`/api/alerts/${nilId}`, admin.jar);
  assert.equal(missingAlert.status, 404, "unknown alert id");

  const malformedUser = await get("/api/users/not-a-uuid", admin.jar);
  assert.equal(malformedUser.status, 400, "malformed user id");
});

test("ADMIN-only approval endpoint: admin reaches service, others are blocked", async () => {
  const asAdmin = await post(`/api/users/${doctorUserId}/approve`, admin.jar);
  assert.equal(
    asAdmin.status,
    409,
    "admin reaches the approval service, which rejects non-patients",
  );
  assert.equal(asAdmin.body.message, "Only patient accounts can be approved.");

  for (const account of [doctor, ot, patientA]) {
    const response = await post(`/api/users/${patientAUserId}/approve`, account.jar);
    assert.equal(response.status, 403, "approval must be 403 for non-admins");
    assert.equal(response.body.success, false);
  }
});