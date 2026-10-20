import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";

test("schedule mutation and audit record commit or roll back together", async () => {
  const connectionString = process.env.DATABASE_URL;

  assert.ok(connectionString, "DATABASE_URL must be configured.");

  const pool = new Pool({ connectionString, max: 3 });
  const runId = randomUUID().replaceAll("-", "").slice(0, 12);

  const departmentId = randomUUID();
  const roomId = randomUUID();
  const userId = randomUUID();
  const patientId = randomUUID();
  const scheduleId = randomUUID();

  let fixturesCommitted = false;

  try {
    const now = new Date();

    // Create isolated fixtures for this test.
    const setup = await pool.connect();

    try {
      await setup.query("BEGIN");

      await setup.query(
        `INSERT INTO "Department" (
          "id", "name", "isActive", "createdAt", "updatedAt"
        ) VALUES ($1, $2, TRUE, $3, $3)`,
        [departmentId, `Audit Atomicity ${runId}`, now],
      );

      await setup.query(
        `INSERT INTO "OTRoom" (
          "id", "name", "code", "departmentId",
          "status", "isActive", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, 'AVAILABLE', TRUE, $5, $5)`,
        [
          roomId,
          "Audit Atomicity Room",
          `AA-${runId}`,
          departmentId,
          now,
        ],
      );

      await setup.query(
        `INSERT INTO "User" (
          "id", "email", "passwordHash", "name",
          "role", "status", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, 'DOCTOR', 'ACTIVE', $5, $5)`,
        [
          userId,
          `audit-atomicity-${runId}@example.invalid`,
          "test-only-password-hash",
          "Audit Atomicity Surgeon",
          now,
        ],
      );

      await setup.query(
        `INSERT INTO "Patient" (
          "id", "patientCode", "name", "createdAt", "updatedAt"
        ) VALUES ($1, $2, $3, $4, $4)`,
        [
          patientId,
          `AA-${runId}`,
          "Audit Atomicity Patient",
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
          userId,
          "Audit atomicity test",
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

    // Case 1: the schedule update and its audit record commit together.
    const successfulTransaction = await pool.connect();

    try {
      await successfulTransaction.query("BEGIN");

      await successfulTransaction.query(
        `UPDATE "Schedule"
         SET "status" = 'CONFIRMED', "updatedAt" = NOW()
         WHERE "id" = $1 AND "status" = 'SCHEDULED'`,
        [scheduleId],
      );

      await successfulTransaction.query(
        `INSERT INTO "AuditLog" (
          "id", "userId", "action", "entity", "entityId",
          "description", "metadata", "createdAt"
        ) VALUES (
          $1, $2, 'UPDATE', 'Schedule', $3,
          $4, $5::jsonb, NOW()
        )`,
        [
          randomUUID(),
          userId,
          scheduleId,
          "Schedule status changed to CONFIRMED.",
          JSON.stringify({ status: "CONFIRMED" }),
        ],
      );

      await successfulTransaction.query("COMMIT");
    } catch (error) {
      await successfulTransaction.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      successfulTransaction.release();
    }

    const committedState = await pool.query<{
      status: string;
      auditCount: string;
    }>(
      `SELECT
         s."status",
         (
           SELECT COUNT(*)::text
           FROM "AuditLog" a
           WHERE a."entity" = 'Schedule'
             AND a."entityId" = s."id"
         ) AS "auditCount"
       FROM "Schedule" s
       WHERE s."id" = $1`,
      [scheduleId],
    );

    assert.equal(committedState.rowCount, 1);
    assert.equal(committedState.rows[0].status, "CONFIRMED");
    assert.equal(
      committedState.rows[0].auditCount,
      "1",
      "The successful mutation should have one audit record.",
    );

    // Case 2: an invalid audit user violates the foreign key.
    // The preceding schedule update must be rolled back.
    const failedTransaction = await pool.connect();

    let auditInsertError: unknown;

    try {
      await failedTransaction.query("BEGIN");

      const update = await failedTransaction.query(
        `UPDATE "Schedule"
         SET "status" = 'CANCELLED', "updatedAt" = NOW()
         WHERE "id" = $1 AND "status" = 'CONFIRMED'`,
        [scheduleId],
      );

      assert.equal(
        update.rowCount,
        1,
        "The schedule should be updated inside the transaction before the audit failure.",
      );

      try {
        await failedTransaction.query(
          `INSERT INTO "AuditLog" (
            "id", "userId", "action", "entity", "entityId",
            "description", "metadata", "createdAt"
          ) VALUES (
            $1, $2, 'CANCEL', 'Schedule', $3,
            $4, $5::jsonb, NOW()
          )`,
          [
            randomUUID(),
            randomUUID(),
            scheduleId,
            "This audit insert should fail.",
            JSON.stringify({ status: "CANCELLED" }),
          ],
        );
      } catch (error) {
        auditInsertError = error;
      }

      assert.ok(
        auditInsertError,
        "The audit insert should fail for a non-existent user.",
      );

      assert.equal(
        (auditInsertError as { code?: string }).code,
        "23503",
        "The audit insert should fail with a foreign-key violation.",
      );

      await failedTransaction.query("ROLLBACK");
    } catch (error) {
      await failedTransaction.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      failedTransaction.release();
    }

    const rolledBackState = await pool.query<{
      status: string;
      auditCount: string;
    }>(
      `SELECT
         s."status",
         (
           SELECT COUNT(*)::text
           FROM "AuditLog" a
           WHERE a."entity" = 'Schedule'
             AND a."entityId" = s."id"
         ) AS "auditCount"
       FROM "Schedule" s
       WHERE s."id" = $1`,
      [scheduleId],
    );

    assert.equal(rolledBackState.rowCount, 1);
    assert.equal(
      rolledBackState.rows[0].status,
      "CONFIRMED",
      "The schedule mutation must roll back when audit insertion fails.",
    );
    assert.equal(
      rolledBackState.rows[0].auditCount,
      "1",
      "The failed transaction must not leave an additional audit record.",
    );
  } finally {
    try {
      if (fixturesCommitted) {
        await pool.query(
          `DELETE FROM "AuditLog"
           WHERE "entity" = 'Schedule' AND "entityId" = $1`,
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
          [userId],
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
