import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import { updateScheduleStatus } from "@/modules/schedules/schedule.repository";

test("concurrent status updates from the same initial state allow only one winner", async () => {
  const connectionString = process.env.DATABASE_URL;

  assert.ok(connectionString, "DATABASE_URL must be configured.");

  const pool = new Pool({ connectionString, max: 5 });
  const runId = randomUUID().replaceAll("-", "").slice(0, 12);

  const departmentId = randomUUID();
  const roomId = randomUUID();
  const surgeonId = randomUUID();
  const patientId = randomUUID();
  const scheduleId = randomUUID();

  let fixturesCommitted = false;

  try {
    const now = new Date();

    const setup = await pool.connect();

    try {
      await setup.query("BEGIN");

      await setup.query(
        `INSERT INTO "Department" (
          "id", "name", "isActive", "createdAt", "updatedAt"
        ) VALUES ($1, $2, TRUE, $3, $3)`,
        [departmentId, `Status Concurrency ${runId}`, now],
      );

      await setup.query(
        `INSERT INTO "OTRoom" (
          "id", "name", "code", "departmentId",
          "status", "isActive", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, 'AVAILABLE', TRUE, $5, $5)`,
        [roomId, "Status Test Room", `SC-${runId}`, departmentId, now],
      );

      await setup.query(
        `INSERT INTO "User" (
          "id", "email", "passwordHash", "name",
          "role", "status", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, 'DOCTOR', 'ACTIVE', $5, $5)`,
        [
          surgeonId,
          `status-concurrency-${runId}@example.invalid`,
          "test-only-password-hash",
          "Status Concurrency Surgeon",
          now,
        ],
      );

      await setup.query(
        `INSERT INTO "Patient" (
          "id", "patientCode", "name", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $4)`,
        [
          patientId,
          `SC-${runId}`,
          "Status Concurrency Patient",
          now,
        ],
      );

      await setup.query(
        `INSERT INTO "Schedule" (
          "id", "patientId", "departmentId", "otRoomId",
          "surgeonId", "createdById", "procedure", "scheduledDate",
          "startTime", "endTime", "status", "priority",
          "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $5, $6, $7, $8, $9,
          'SCHEDULED', 'ELECTIVE', $10, $10
        )`,
        [
          scheduleId,
          patientId,
          departmentId,
          roomId,
          surgeonId,
          "Status concurrency test",
          "2030-01-01 00:00:00",
          "2030-01-01 10:00:00",
          "2030-01-01 11:00:00",
          now,
        ],
      );

      await setup.query("COMMIT");
      fixturesCommitted = true;
    } catch (error) {
      await setup.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      setup.release();
    }

    const attempts = await Promise.allSettled([
      updateScheduleStatus(
        scheduleId,
        "CONFIRMED",
        "SCHEDULED",
        surgeonId,
      ),
      updateScheduleStatus(
        scheduleId,
        "CANCELLED",
        "SCHEDULED",
        surgeonId,
      ),
    ]);

    const winners = attempts.filter(
      (attempt) => attempt.status === "fulfilled",
    );
    const conflicts = attempts.filter(
      (attempt) => attempt.status === "rejected",
    );

    assert.equal(winners.length, 1, "Exactly one competing update should succeed.");
    assert.equal(conflicts.length, 1, "The stale update should be rejected.");
    assert.equal(conflicts[0].status, "rejected");

    if (conflicts[0].status === "rejected") {
      assert.ok(conflicts[0].reason instanceof Error);
      assert.equal(conflicts[0].reason.message, "SCHEDULE_STATUS_CONFLICT");
    }

    const finalState = await pool.query<{ status: string }>(
      `SELECT "status" FROM "Schedule" WHERE "id" = $1`,
      [scheduleId],
    );

    assert.equal(finalState.rowCount, 1);
    assert.ok(
      ["CONFIRMED", "CANCELLED"].includes(finalState.rows[0].status),
      "The final status must be the winning update.",
    );

    const auditRecords = await pool.query<{ action: string }>(
      `SELECT "action"
       FROM "AuditLog"
       WHERE "entity" = 'Schedule' AND "entityId" = $1`,
      [scheduleId],
    );

    assert.equal(auditRecords.rowCount, 1);
    assert.equal(
      auditRecords.rows[0].action,
      finalState.rows[0].status === "CANCELLED" ? "CANCEL" : "UPDATE",
    );
  } finally {
    try {
      if (fixturesCommitted) {
        await pool.query(
          `DELETE FROM "AuditLog" WHERE "entity" = 'Schedule' AND "entityId" = $1`,
          [scheduleId],
        );
        await pool.query(
          `DELETE FROM "Schedule" WHERE "id" = $1`,
          [scheduleId],
        );
        await pool.query(
          `DELETE FROM "Patient" WHERE "id" = $1`,
          [patientId],
        );
        await pool.query(
          `DELETE FROM "User" WHERE "id" = $1`,
          [surgeonId],
        );
        await pool.query(
          `DELETE FROM "OTRoom" WHERE "id" = $1`,
          [roomId],
        );
        await pool.query(
          `DELETE FROM "Department" WHERE "id" = $1`,
          [departmentId],
        );
      }
    } finally {
      await pool.end();
    }
  }
});
