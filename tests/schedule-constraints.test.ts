import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool, type PoolClient } from "pg";

type ScheduleStatus = "SCHEDULED" | "CANCELLED" | "COMPLETED";

interface ScheduleFixture {
  patientId: string;
  otRoomId: string;
  surgeonId: string;
  startTime: string;
  endTime: string;
  status: ScheduleStatus;
  procedure: string;
}

async function insertSchedule(
  client: PoolClient,
  data: ScheduleFixture,
  departmentId: string,
  createdById: string,
) {
  await client.query(
    `INSERT INTO "Schedule" (
      "id",
      "patientId",
      "departmentId",
      "otRoomId",
      "surgeonId",
      "createdById",
      "procedure",
      "scheduledDate",
      "startTime",
      "endTime",
      "status",
      "priority",
      "createdAt",
      "updatedAt"
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7,
      $8, $9, $10, $11, 'ELECTIVE', NOW(), NOW()
    )`,
    [
      randomUUID(),
      data.patientId,
      departmentId,
      data.otRoomId,
      data.surgeonId,
      createdById,
      data.procedure,
      "2030-01-01 00:00:00",
      data.startTime,
      data.endTime,
      data.status,
    ],
  );
}

async function expectConstraintViolation(
  client: PoolClient,
  expectedConstraint: string,
  operation: () => Promise<void>,
) {
  const savepoint = `sp_${randomUUID().replaceAll("-", "")}`;

  await client.query(`SAVEPOINT ${savepoint}`);

  let caught: unknown;

  try {
    await operation();
  } catch (error) {
    caught = error;
  }

  await client.query(`ROLLBACK TO SAVEPOINT ${savepoint}`);
  await client.query(`RELEASE SAVEPOINT ${savepoint}`);

  assert.ok(
    caught instanceof Error,
    `Expected constraint ${expectedConstraint} to reject the operation`,
  );

  assert.equal(
    (caught as Error & { constraint?: string }).constraint,
    expectedConstraint,
  );
}

test("PostgreSQL schedule overlap constraints", async (t) => {
  const connectionString = process.env.DATABASE_URL;

  assert.ok(
    connectionString,
    "DATABASE_URL must be configured in your local .env file",
  );

  const pool = new Pool({ connectionString });
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const runId = randomUUID().replaceAll("-", "").slice(0, 12);
    const departmentId = randomUUID();
    const room1Id = randomUUID();
    const room2Id = randomUUID();
    const surgeon1Id = randomUUID();
    const surgeon2Id = randomUUID();
    const patient1Id = randomUUID();
    const patient2Id = randomUUID();

    const now = new Date();

    await client.query(
      `INSERT INTO "Department" (
        "id", "name", "isActive", "createdAt", "updatedAt"
      ) VALUES ($1, $2, TRUE, $3, $3)`,
      [departmentId, `Constraint Test ${runId}`, now],
    );

    for (const room of [
      { id: room1Id, name: "Room A", code: `T-${runId}-A` },
      { id: room2Id, name: "Room B", code: `T-${runId}-B` },
    ]) {
      await client.query(
        `INSERT INTO "OTRoom" (
          "id", "name", "code", "departmentId",
          "status", "isActive", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, 'AVAILABLE', TRUE, $5, $5)`,
        [room.id, room.name, room.code, departmentId, now],
      );
    }

    for (const [id, suffix] of [
      [surgeon1Id, "A"],
      [surgeon2Id, "B"],
    ]) {
      await client.query(
        `INSERT INTO "User" (
          "id", "email", "passwordHash", "name",
          "role", "status", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, 'DOCTOR', 'ACTIVE', $5, $5)`,
        [
          id,
          `constraint-${runId}-${suffix}@example.invalid`,
          "test-only-password-hash",
          `Test Surgeon ${suffix}`,
          now,
        ],
      );
    }

    for (const [id, suffix] of [
      [patient1Id, "A"],
      [patient2Id, "B"],
    ]) {
      await client.query(
        `INSERT INTO "Patient" (
          "id", "patientCode", "name", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $4)`,
        [
          id,
          `TEST-${runId}-${suffix}`,
          `Test Patient ${suffix}`,
          now,
        ],
      );
    }

    const baseSchedule: ScheduleFixture = {
      patientId: patient1Id,
      otRoomId: room1Id,
      surgeonId: surgeon1Id,
      startTime: "2030-01-01 10:00:00",
      endTime: "2030-01-01 11:00:00",
      status: "SCHEDULED",
      procedure: "Baseline test procedure",
    };

    await insertSchedule(
      client,
      baseSchedule,
      departmentId,
      surgeon1Id,
    );

    await t.test("rejects an overlapping room booking", async () => {
      await expectConstraintViolation(
        client,
        "Schedule_no_room_overlap",
        () =>
          insertSchedule(
            client,
            {
              ...baseSchedule,
              patientId: patient2Id,
              surgeonId: surgeon2Id,
              startTime: "2030-01-01 10:15:00",
              endTime: "2030-01-01 10:45:00",
              procedure: "Room conflict test",
            },
            departmentId,
            surgeon1Id,
          ),
      );
    });

    await t.test("rejects an overlapping surgeon booking", async () => {
      await expectConstraintViolation(
        client,
        "Schedule_no_surgeon_overlap",
        () =>
          insertSchedule(
            client,
            {
              ...baseSchedule,
              patientId: patient2Id,
              otRoomId: room2Id,
              startTime: "2030-01-01 10:15:00",
              endTime: "2030-01-01 10:45:00",
              procedure: "Surgeon conflict test",
            },
            departmentId,
            surgeon1Id,
          ),
      );
    });

    await t.test("rejects an overlapping patient booking", async () => {
      await expectConstraintViolation(
        client,
        "Schedule_no_patient_overlap",
        () =>
          insertSchedule(
            client,
            {
              ...baseSchedule,
              otRoomId: room2Id,
              surgeonId: surgeon2Id,
              startTime: "2030-01-01 10:15:00",
              endTime: "2030-01-01 10:45:00",
              procedure: "Patient conflict test",
            },
            departmentId,
            surgeon1Id,
          ),
      );
    });

    await t.test("allows adjacent bookings", async () => {
      await insertSchedule(
        client,
        {
          ...baseSchedule,
          startTime: "2030-01-01 11:00:00",
          endTime: "2030-01-01 12:00:00",
          procedure: "Adjacent booking test",
        },
        departmentId,
        surgeon1Id,
      );
    });

    await t.test("allows overlapping cancelled schedules", async () => {
      await insertSchedule(
        client,
        {
          ...baseSchedule,
          startTime: "2030-01-01 10:15:00",
          endTime: "2030-01-01 10:45:00",
          status: "CANCELLED",
          procedure: "Cancelled schedule test",
        },
        departmentId,
        surgeon1Id,
      );
    });

    await t.test("allows overlapping completed schedules", async () => {
      await insertSchedule(
        client,
        {
          ...baseSchedule,
          startTime: "2030-01-01 10:15:00",
          endTime: "2030-01-01 10:45:00",
          status: "COMPLETED",
          procedure: "Completed schedule test",
        },
        departmentId,
        surgeon1Id,
      );
    });
  } finally {
    try {
      await client.query("ROLLBACK");
    } finally {
      client.release();
      await pool.end();
    }
  }
});

test("concurrent overlapping inserts cannot double-book an OT room", async () => {
  const connectionString = process.env.DATABASE_URL;

  assert.ok(connectionString, "DATABASE_URL must be configured.");

  const pool = new Pool({ connectionString, max: 5 });
  const setupClient = await pool.connect();

  const runId = randomUUID().replaceAll("-", "").slice(0, 12);
  const departmentId = randomUUID();
  const roomId = randomUUID();
  const surgeon1Id = randomUUID();
  const surgeon2Id = randomUUID();
  const patient1Id = randomUUID();
  const patient2Id = randomUUID();

  let fixturesCommitted = false;
  let firstClient: PoolClient | undefined;
  let secondClient: PoolClient | undefined;
  let firstInTransaction = false;
  let secondInTransaction = false;

  let competingAttempt:
    | Promise<{ ok: true } | { ok: false; error: unknown }>
    | undefined;

  try {
    const now = new Date();

    await setupClient.query("BEGIN");

    try {
      await setupClient.query(
        `INSERT INTO "Department" (
          "id", "name", "isActive", "createdAt", "updatedAt"
        ) VALUES ($1, $2, TRUE, $3, $3)`,
        [departmentId, `Concurrency Test ${runId}`, now],
      );

      await setupClient.query(
        `INSERT INTO "OTRoom" (
          "id", "name", "code", "departmentId",
          "status", "isActive", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, 'AVAILABLE', TRUE, $5, $5)`,
        [roomId, "Concurrency Test Room", `CT-${runId}`, departmentId, now],
      );

      for (const [id, suffix] of [
        [surgeon1Id, "A"],
        [surgeon2Id, "B"],
      ]) {
        await setupClient.query(
          `INSERT INTO "User" (
            "id", "email", "passwordHash", "name",
            "role", "status", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, 'DOCTOR', 'ACTIVE', $5, $5)`,
          [
            id,
            `concurrent-${runId}-${suffix}@example.invalid`,
            "test-only-password-hash",
            `Concurrency Surgeon ${suffix}`,
            now,
          ],
        );
      }

      for (const [id, suffix] of [
        [patient1Id, "A"],
        [patient2Id, "B"],
      ]) {
        await setupClient.query(
          `INSERT INTO "Patient" (
            "id", "patientCode", "name", "createdAt", "updatedAt"
          ) VALUES ($1, $2, $3, $4, $4)`,
          [id, `CON-${runId}-${suffix}`, `Concurrency Patient ${suffix}`, now],
        );
      }

      await setupClient.query("COMMIT");
      fixturesCommitted = true;
    } catch (error) {
      await setupClient.query("ROLLBACK");
      throw error;
    }

    firstClient = await pool.connect();
    secondClient = await pool.connect();

    await firstClient.query("BEGIN");
    firstInTransaction = true;

    await secondClient.query("BEGIN");
    secondInTransaction = true;

    const firstSchedule: ScheduleFixture = {
      patientId: patient1Id,
      otRoomId: roomId,
      surgeonId: surgeon1Id,
      startTime: "2030-01-01 10:00:00",
      endTime: "2030-01-01 11:00:00",
      status: "SCHEDULED",
      procedure: "Concurrent booking A",
    };

    const secondSchedule: ScheduleFixture = {
      patientId: patient2Id,
      otRoomId: roomId,
      surgeonId: surgeon2Id,
      startTime: "2030-01-01 10:15:00",
      endTime: "2030-01-01 10:45:00",
      status: "SCHEDULED",
      procedure: "Concurrent booking B",
    };

    await insertSchedule(
      firstClient,
      firstSchedule,
      departmentId,
      surgeon1Id,
    );

    const pidResult = await secondClient.query<{ pid: number }>(
      "SELECT pg_backend_pid() AS pid",
    );

    const secondPid = pidResult.rows[0].pid;

    competingAttempt = insertSchedule(
      secondClient,
      secondSchedule,
      departmentId,
      surgeon1Id,
    ).then(
      () => ({ ok: true as const }),
      (error: unknown) => ({ ok: false as const, error }),
    );

    // Wait until PostgreSQL confirms that the second insert is waiting
    // on the uncommitted, conflicting booking.
    let lockObserved = false;

    for (let attempt = 0; attempt < 100; attempt++) {
      const result = await setupClient.query<{ waiting: boolean }>(
        `SELECT EXISTS (
          SELECT 1
          FROM pg_stat_activity
          WHERE pid = $1
            AND wait_event_type = 'Lock'
        ) AS waiting`,
        [secondPid],
      );

      if (result.rows[0]?.waiting) {
        lockObserved = true;
        break;
      }

      await new Promise<void>((resolve) => setTimeout(resolve, 10));
    }

    assert.ok(
      lockObserved,
      "The competing insert never reached a PostgreSQL lock wait.",
    );

    // Commit the first booking. PostgreSQL should then reject the second.
    await firstClient.query("COMMIT");
    firstInTransaction = false;

    const result = await competingAttempt;

    if (result.ok) {
      throw new Error("The conflicting concurrent booking was accepted.");
    }

    assert.equal(
      (result.error as { constraint?: string }).constraint,
      "Schedule_no_room_overlap",
    );

    await secondClient.query("ROLLBACK");
    secondInTransaction = false;
  } finally {
    if (firstClient && firstInTransaction) {
      await firstClient.query("ROLLBACK").catch(() => undefined);
    }

    if (competingAttempt) {
      await competingAttempt;
    }

    if (secondClient && secondInTransaction) {
      await secondClient.query("ROLLBACK").catch(() => undefined);
    }

    firstClient?.release();
    secondClient?.release();

    try {
      if (fixturesCommitted) {
        await setupClient.query(
          'DELETE FROM "Schedule" WHERE "departmentId" = $1',
          [departmentId],
        );

        await setupClient.query(
          'DELETE FROM "Patient" WHERE "id" = ANY($1::text[])',
          [[patient1Id, patient2Id]],
        );

        await setupClient.query(
          'DELETE FROM "User" WHERE "id" = ANY($1::text[])',
          [[surgeon1Id, surgeon2Id]],
        );

        await setupClient.query(
          'DELETE FROM "OTRoom" WHERE "id" = $1',
          [roomId],
        );

        await setupClient.query(
          'DELETE FROM "Department" WHERE "id" = $1',
          [departmentId],
        );
      }
    } finally {
      setupClient.release();
      await pool.end();
    }
  }
});