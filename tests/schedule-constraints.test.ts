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