import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import {
  createScheduleStaff,
  deleteScheduleStaff,
  createScheduleEquipment,
  releaseScheduleEquipment,
  createScheduleNote,
  updateScheduleNote,
  deleteScheduleNote,
} from "@/modules/schedules/schedule.repository";

test("schedule staff, equipment, and note repositories audit atomically", async (t) => {
  const connectionString = process.env.DATABASE_URL;
  assert.ok(connectionString, "DATABASE_URL must be configured.");

  const pool = new Pool({ connectionString, max: 4 });
  const runId = randomUUID().replaceAll("-", "").slice(0, 12);
  const departmentId = randomUUID();
  const roomId = randomUUID();
  const actorId = randomUUID();
  const staffUserId = randomUUID();
  const patientId = randomUUID();
  const scheduleId = randomUUID();
  const equipmentId = randomUUID();
  const rollbackEquipmentId = randomUUID();
  const invalidActorId = randomUUID();
  let fixturesCommitted = false;

  let staffAssignmentId: string | undefined;
  let equipmentAssignmentId: string | undefined;
  let noteId: string | undefined;

  try {
    const now = new Date();
    const setup = await pool.connect();

    try {
      await setup.query("BEGIN");
      await setup.query(
        `INSERT INTO "Department" ("id", "name", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, TRUE, $3, $3)`,
        [departmentId, `Related Repository Audit ${runId}`, now],
      );
      await setup.query(
        `INSERT INTO "OTRoom" ("id", "name", "code", "departmentId", "status", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'AVAILABLE', TRUE, $5, $5)`,
        [roomId, "Related Audit Room", `RRA-${runId}`, departmentId, now],
      );

      for (const user of [
        { id: actorId, suffix: "actor", name: "Related Audit Actor" },
        { id: staffUserId, suffix: "staff", name: "Related Audit Staff" },
      ]) {
        await setup.query(
          `INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "status", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, 'DOCTOR', 'ACTIVE', $5, $5)`,
          [user.id, `related-audit-${runId}-${user.suffix}@example.invalid`, "test-only-password-hash", user.name, now],
        );
      }

      await setup.query(
        `INSERT INTO "Patient" ("id", "patientCode", "name", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $4)`,
        [patientId, `RRA-${runId}`, "Related Audit Patient", now],
      );
      await setup.query(
        `INSERT INTO "Schedule" (
           "id", "patientId", "departmentId", "otRoomId", "surgeonId", "createdById",
           "procedure", "scheduledDate", "startTime", "endTime", "status", "priority", "createdAt", "updatedAt"
         ) VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9, 'SCHEDULED', 'ELECTIVE', $10, $10)`,
        [scheduleId, patientId, departmentId, roomId, actorId, "Related audit test procedure", "2030-01-01 00:00:00", "2030-01-01 10:00:00", "2030-01-01 11:00:00", now],
      );

      for (const equipment of [
        { id: equipmentId, name: "Audit Test Equipment", serial: `RRA-E-${runId}` },
        { id: rollbackEquipmentId, name: "Audit Rollback Equipment", serial: `RRA-R-${runId}` },
      ]) {
        await setup.query(
          `INSERT INTO "Equipment" (
             "id", "name", "category", "serialNumber", "status", "departmentId", "createdAt", "updatedAt"
           ) VALUES ($1, $2, 'TEST', $3, 'AVAILABLE', $4, $5, $5)`,
          [equipment.id, equipment.name, equipment.serial, departmentId, now],
        );
      }

      await setup.query("COMMIT");
      fixturesCommitted = true;
    } catch (error) {
      await setup.query("ROLLBACK").catch(() => undefined);
      throw error;
    } finally {
      setup.release();
    }

    await t.test("staff assignment writes an audit record", async () => {
      const assignment = await createScheduleStaff(
        { scheduleId, userId: staffUserId, role: "NURSE" },
        actorId,
      );
      staffAssignmentId = assignment.id;

      const audit = await pool.query<{ action: string; userId: string | null }>(
        `SELECT "action", "userId" FROM "AuditLog" WHERE "entity" = 'ScheduleStaff' AND "entityId" = $1`,
        [assignment.id],
      );
      assert.equal(audit.rowCount, 1);
      assert.equal(audit.rows[0].action, "CREATE");
      assert.equal(audit.rows[0].userId, actorId);
    });

    await t.test("failed staff-assignment audit rolls back the assignment", async () => {
      await assert.rejects(
        createScheduleStaff({ scheduleId, userId: staffUserId, role: "TECHNICIAN" }, invalidActorId),
      );
      const result = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM "ScheduleStaff" WHERE "scheduleId" = $1 AND "role" = 'TECHNICIAN'`,
        [scheduleId],
      );
      assert.equal(result.rows[0].count, "0");
    });

    await t.test("failed staff-removal audit preserves the assignment", async () => {
      assert.ok(staffAssignmentId);
      await assert.rejects(deleteScheduleStaff(staffAssignmentId, scheduleId, invalidActorId));
      const result = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM "ScheduleStaff" WHERE "id" = $1`,
        [staffAssignmentId],
      );
      assert.equal(result.rows[0].count, "1");
    });

    await t.test("successful staff removal writes an audit record", async () => {
      assert.ok(staffAssignmentId);
      await deleteScheduleStaff(staffAssignmentId, scheduleId, actorId);
      const audit = await pool.query<{ action: string }>(
        `SELECT "action" FROM "AuditLog" WHERE "entity" = 'ScheduleStaff' AND "entityId" = $1 AND "action" = 'DELETE'`,
        [staffAssignmentId],
      );
      assert.equal(audit.rowCount, 1);
    });

    await t.test("equipment assignment writes an audit record and claims equipment", async () => {
      const assignment = await createScheduleEquipment({ scheduleId, equipmentId }, actorId);
      equipmentAssignmentId = assignment.id;
      const state = await pool.query<{ status: string }>(
        `SELECT "status" FROM "Equipment" WHERE "id" = $1`,
        [equipmentId],
      );
      const audit = await pool.query<{ action: string }>(
        `SELECT "action" FROM "AuditLog" WHERE "entity" = 'ScheduleEquipment' AND "entityId" = $1 AND "action" = 'CREATE'`,
        [assignment.id],
      );
      assert.equal(state.rows[0].status, "IN_USE");
      assert.equal(audit.rowCount, 1);
    });

    await t.test("failed equipment-assignment audit rolls back assignment and equipment claim", async () => {
      await assert.rejects(
        createScheduleEquipment({ scheduleId, equipmentId: rollbackEquipmentId }, invalidActorId),
      );
      const [assignment, equipment] = await Promise.all([
        pool.query<{ count: string }>(
          `SELECT COUNT(*)::text AS count FROM "ScheduleEquipment" WHERE "scheduleId" = $1 AND "equipmentId" = $2`,
          [scheduleId, rollbackEquipmentId],
        ),
        pool.query<{ status: string }>(`SELECT "status" FROM "Equipment" WHERE "id" = $1`, [rollbackEquipmentId]),
      ]);
      assert.equal(assignment.rows[0].count, "0");
      assert.equal(equipment.rows[0].status, "AVAILABLE");
    });

    await t.test("failed equipment-release audit rolls back release and availability change", async () => {
      assert.ok(equipmentAssignmentId);
      await assert.rejects(releaseScheduleEquipment(equipmentAssignmentId, scheduleId, invalidActorId));
      const [assignment, equipment] = await Promise.all([
        pool.query<{ releasedAt: Date | null }>(
          `SELECT "releasedAt" FROM "ScheduleEquipment" WHERE "id" = $1`,
          [equipmentAssignmentId],
        ),
        pool.query<{ status: string }>(`SELECT "status" FROM "Equipment" WHERE "id" = $1`, [equipmentId]),
      ]);
      assert.equal(assignment.rows[0].releasedAt, null);
      assert.equal(equipment.rows[0].status, "IN_USE");
    });

    await t.test("successful equipment release writes an audit record and frees equipment", async () => {
      assert.ok(equipmentAssignmentId);
      await releaseScheduleEquipment(equipmentAssignmentId, scheduleId, actorId);
      const [equipment, audit] = await Promise.all([
        pool.query<{ status: string }>(`SELECT "status" FROM "Equipment" WHERE "id" = $1`, [equipmentId]),
        pool.query<{ action: string }>(
          `SELECT "action" FROM "AuditLog" WHERE "entity" = 'ScheduleEquipment' AND "entityId" = $1 AND "action" = 'UPDATE'`,
          [equipmentAssignmentId],
        ),
      ]);
      assert.equal(equipment.rows[0].status, "AVAILABLE");
      assert.equal(audit.rowCount, 1);
    });

    await t.test("schedule-note creation writes an audit record", async () => {
      const note = await createScheduleNote({
        scheduleId,
        authorId: actorId,
        content: "Initial audit test note",
      });
      noteId = note.id;
      const audit = await pool.query<{ action: string; userId: string | null }>(
        `SELECT "action", "userId" FROM "AuditLog" WHERE "entity" = 'ScheduleNote' AND "entityId" = $1 AND "action" = 'CREATE'`,
        [note.id],
      );
      assert.equal(audit.rowCount, 1);
      assert.equal(audit.rows[0].userId, actorId);
    });

    await t.test("failed schedule-note update audit preserves the original content", async () => {
      assert.ok(noteId);
      await assert.rejects(updateScheduleNote(noteId, "This content must roll back", invalidActorId));
      const note = await pool.query<{ content: string }>(`SELECT "content" FROM "ScheduleNote" WHERE "id" = $1`, [noteId]);
      assert.equal(note.rows[0].content, "Initial audit test note");
    });

    await t.test("successful schedule-note update writes an audit record", async () => {
      assert.ok(noteId);
      const updated = await updateScheduleNote(noteId, "Updated audit test note", actorId);
      assert.equal(updated.content, "Updated audit test note");
      const audit = await pool.query<{ action: string }>(
        `SELECT "action" FROM "AuditLog" WHERE "entity" = 'ScheduleNote' AND "entityId" = $1 AND "action" = 'UPDATE'`,
        [noteId],
      );
      assert.equal(audit.rowCount, 1);
    });

    await t.test("failed schedule-note deletion audit preserves the note", async () => {
      assert.ok(noteId);
      await assert.rejects(deleteScheduleNote(noteId, invalidActorId));
      const note = await pool.query<{ count: string }>(
        `SELECT COUNT(*)::text AS count FROM "ScheduleNote" WHERE "id" = $1`,
        [noteId],
      );
      assert.equal(note.rows[0].count, "1");
    });

    await t.test("successful schedule-note deletion writes an audit record", async () => {
      assert.ok(noteId);
      await deleteScheduleNote(noteId, actorId);
      const audit = await pool.query<{ action: string }>(
        `SELECT "action" FROM "AuditLog" WHERE "entity" = 'ScheduleNote' AND "entityId" = $1 AND "action" = 'DELETE'`,
        [noteId],
      );
      assert.equal(audit.rowCount, 1);
    });
  } finally {
    try {
      if (fixturesCommitted) {
        await pool.query(
          `DELETE FROM "AuditLog"
           WHERE ("entity" = 'Schedule' AND "entityId" = $1)
              OR "metadata"->>'scheduleId' = $1
              OR "entityId" = ANY($2::text[])`,
          [scheduleId, [staffAssignmentId, equipmentAssignmentId, noteId].filter(Boolean)],
        );
        await pool.query(`DELETE FROM "ScheduleNote" WHERE "scheduleId" = $1`, [scheduleId]);
        await pool.query(`DELETE FROM "ScheduleEquipment" WHERE "scheduleId" = $1`, [scheduleId]);
        await pool.query(`DELETE FROM "ScheduleStaff" WHERE "scheduleId" = $1`, [scheduleId]);
        await pool.query(`DELETE FROM "Schedule" WHERE "id" = $1`, [scheduleId]);
        await pool.query(`DELETE FROM "Equipment" WHERE "id" = ANY($1::text[])`, [[equipmentId, rollbackEquipmentId]]);
        await pool.query(`DELETE FROM "Patient" WHERE "id" = $1`, [patientId]);
        await pool.query(`DELETE FROM "User" WHERE "id" = ANY($1::text[])`, [[actorId, staffUserId]]);
        await pool.query(`DELETE FROM "OTRoom" WHERE "id" = $1`, [roomId]);
        await pool.query(`DELETE FROM "Department" WHERE "id" = $1`, [departmentId]);
      }
    } finally {
      await pool.end();
    }
  }
});
