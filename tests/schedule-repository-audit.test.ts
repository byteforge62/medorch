import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import {
  updateSchedule,
  updateScheduleStatus,
} from "@/modules/schedules/schedule.repository";

test("schedule repository writes audit logs atomically", async (t) => {
  const connectionString = process.env.DATABASE_URL;
  assert.ok(connectionString, "DATABASE_URL must be configured.");

  const pool = new Pool({ connectionString, max: 3 });
  const runId = randomUUID().replaceAll("-", "").slice(0, 12);
  const departmentId = randomUUID();
  const roomId = randomUUID();
  const userId = randomUUID();
  const patientId = randomUUID();
  const scheduleId = randomUUID();
  const invalidActorId = randomUUID();
  let fixturesCommitted = false;

  try {
    const now = new Date();
    const setup = await pool.connect();

    try {
      await setup.query("BEGIN");
      await setup.query(
        `INSERT INTO "Department" ("id", "name", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, TRUE, $3, $3)`,
        [departmentId, `Repository Audit ${runId}`, now],
      );
      await setup.query(
        `INSERT INTO "OTRoom" ("id", "name", "code", "departmentId", "status", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'AVAILABLE', TRUE, $5, $5)`,
        [roomId, "Repository Audit Room", `RA-${runId}`, departmentId, now],
      );
      await setup.query(
        `INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "status", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'DOCTOR', 'ACTIVE', $5, $5)`,
        [userId, `repository-audit-${runId}@example.invalid`, "test-only-password-hash", "Repository Audit Surgeon", now],
      );
      await setup.query(
        `INSERT INTO "Patient" ("id", "patientCode", "name", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $4)`,
        [patientId, `RA-${runId}`, "Repository Audit Patient", now],
      );
      await setup.query(
        `INSERT INTO "Schedule" (
           "id", "patientId", "departmentId", "otRoomId", "surgeonId", "createdById",
           "procedure", "scheduledDate", "startTime", "endTime", "status", "priority", "createdAt", "updatedAt"
         ) VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9, 'SCHEDULED', 'ELECTIVE', $10, $10)`,
        [scheduleId, patientId, departmentId, roomId, userId, "Initial repository audit procedure", "2030-01-01 00:00:00", "2030-01-01 10:00:00", "2030-01-01 11:00:00", now],
      );
      await setup.query("COMMIT");
      fixturesCommitted = true;
    } catch (error) {
      await setup.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      setup.release();
    }

    await t.test("successful schedule update writes an audit record", async () => {
      const updated = await updateSchedule(
        scheduleId,
        { procedure: "Updated repository audit procedure" },
        userId,
      );

      assert.equal(updated.procedure, "Updated repository audit procedure");

      const audit = await pool.query<{ action: string; entity: string; entityId: string; userId: string | null }>(
        `SELECT "action", "entity", "entityId", "userId"
         FROM "AuditLog"
         WHERE "entity" = 'Schedule' AND "entityId" = $1 AND "action" = 'UPDATE'`,
        [scheduleId],
      );

      assert.equal(audit.rowCount, 1);
      assert.equal(audit.rows[0].entity, "Schedule");
      assert.equal(audit.rows[0].entityId, scheduleId);
      assert.equal(audit.rows[0].userId, userId);
    });

    await t.test("failed audit insert rolls back schedule update", async () => {
      const beforeAuditCount = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM "AuditLog" WHERE "entity" = 'Schedule' AND "entityId" = $1`,
        [scheduleId],
      );

      await assert.rejects(
        updateSchedule(
          scheduleId,
          { procedure: "This update must roll back" },
          invalidActorId,
        ),
      );

      const schedule = await pool.query<{ procedure: string }>(
        `SELECT "procedure" FROM "Schedule" WHERE "id" = $1`,
        [scheduleId],
      );
      const afterAuditCount = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM "AuditLog" WHERE "entity" = 'Schedule' AND "entityId" = $1`,
        [scheduleId],
      );

      assert.equal(schedule.rows[0].procedure, "Updated repository audit procedure");
      assert.equal(afterAuditCount.rows[0].count, beforeAuditCount.rows[0].count);
    });

    await t.test("successful status transition writes an audit record", async () => {
      const updated = await updateScheduleStatus(
        scheduleId,
        "CONFIRMED",
        "SCHEDULED",
        userId,
      );

      assert.equal(updated.status, "CONFIRMED");

      const audit = await pool.query<{ action: string; metadata: { status?: string } }>(
        `SELECT "action", "metadata"
         FROM "AuditLog"
         WHERE "entity" = 'Schedule' AND "entityId" = $1 AND "action" = 'UPDATE'
         ORDER BY "createdAt" DESC`,
        [scheduleId],
      );

      assert.ok(audit.rows.some((row) => row.metadata?.status === "CONFIRMED"));
    });

    await t.test("failed status audit insert rolls back status transition", async () => {
      await assert.rejects(
        updateScheduleStatus(
          scheduleId,
          "CANCELLED",
          "CONFIRMED",
          invalidActorId,
        ),
      );

      const schedule = await pool.query<{ status: string }>(
        `SELECT "status" FROM "Schedule" WHERE "id" = $1`,
        [scheduleId],
      );
      assert.equal(schedule.rows[0].status, "CONFIRMED");
    });
  } finally {
    try {
      if (fixturesCommitted) {
        await pool.query(
          `DELETE FROM "AuditLog" WHERE "entity" = 'Schedule' AND "entityId" = $1`,
          [scheduleId],
        );
        await pool.query(`DELETE FROM "Schedule" WHERE "id" = $1`, [scheduleId]);
        await pool.query(`DELETE FROM "Patient" WHERE "id" = $1`, [patientId]);
        await pool.query(`DELETE FROM "User" WHERE "id" = $1`, [userId]);
        await pool.query(`DELETE FROM "OTRoom" WHERE "id" = $1`, [roomId]);
        await pool.query(`DELETE FROM "Department" WHERE "id" = $1`, [departmentId]);
      }
    } finally {
      await pool.end();
    }
  }
});
