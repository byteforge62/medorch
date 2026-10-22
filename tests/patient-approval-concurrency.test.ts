import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import { approvePatient } from "@/modules/users/user.service";

type ApprovalFixture = {
  pool: Pool;
  patientId: string;
  adminId: string;
};

async function withApprovalFixture(
  run: (fixture: ApprovalFixture) => Promise<void>,
) {
  const connectionString = process.env.DATABASE_URL;

  assert.ok(connectionString, "DATABASE_URL must be configured.");

  const pool = new Pool({ connectionString, max: 5 });
  const runId = randomUUID().replaceAll("-", "").slice(0, 12);
  const patientId = randomUUID();
  const adminId = randomUUID();
  let fixturesCommitted = false;

  try {
    const now = new Date();
    const setup = await pool.connect();

    try {
      await setup.query("BEGIN");

      await setup.query(
        `INSERT INTO "User" (
          "id", "email", "passwordHash", "name", "role", "status",
          "emailVerifiedAt", "createdAt", "updatedAt"
        ) VALUES
          ($1, $2, $3, $4, 'PATIENT', 'PENDING', $5, $6, $6),
          ($7, $8, $3, $9, 'ADMIN', 'ACTIVE', $5, $6, $6)`,
        [
          patientId,
          `approval-patient-${runId}@example.invalid`,
          "test-only-password-hash",
          "Approval Concurrency Patient",
          now,
          now,
          adminId,
          `approval-admin-${runId}@example.invalid`,
          "Approval Test Admin",
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

    await run({ pool, patientId, adminId });
  } finally {
    try {
      if (fixturesCommitted) {
        await pool.query(
          `DELETE FROM "AuditLog"
           WHERE "entity" = 'User' AND "entityId" = $1`,
          [patientId],
        );
        await pool.query(`DELETE FROM "User" WHERE "id" IN ($1, $2)`, [
          patientId,
          adminId,
        ]);
      }
    } finally {
      await pool.end();
    }
  }
}

test("patient approval commits with its audit record", async () => {
  await withApprovalFixture(async ({ pool, patientId, adminId }) => {
    const approvedPatient = await approvePatient(patientId, adminId);

    assert.equal(approvedPatient.id, patientId);
    assert.equal(approvedPatient.role, "PATIENT");
    assert.equal(approvedPatient.status, "ACTIVE");
    assert.ok(approvedPatient.approvedAt);

    const audit = await pool.query<{
      userId: string;
      action: string;
      entity: string;
      entityId: string;
      metadata: { role: string; status: string; approvedAt: string };
    }>(
      `SELECT "userId", "action", "entity", "entityId", "metadata"
       FROM "AuditLog"
       WHERE "entity" = 'User' AND "entityId" = $1`,
      [patientId],
    );

    assert.equal(audit.rowCount, 1);
    assert.equal(audit.rows[0].userId, adminId);
    assert.equal(audit.rows[0].action, "UPDATE");
    assert.equal(audit.rows[0].entityId, patientId);
    assert.equal(audit.rows[0].metadata.role, "PATIENT");
    assert.equal(audit.rows[0].metadata.status, "ACTIVE");
    assert.equal(
      audit.rows[0].metadata.approvedAt,
      approvedPatient.approvedAt?.toISOString(),
    );
  });
});

test("patient approval rolls back when audit insertion fails", async () => {
  await withApprovalFixture(async ({ pool, patientId }) => {
    await assert.rejects(
      () => approvePatient(patientId, randomUUID()),
      (error: unknown) =>
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === "P2003",
    );

    const result = await pool.query<{
      status: string;
      auditCount: string;
    }>(
      `SELECT
         "status",
         (
           SELECT COUNT(*)::text
           FROM "AuditLog"
           WHERE "entity" = 'User' AND "entityId" = $1
         ) AS "auditCount"
       FROM "User"
       WHERE "id" = $1`,
      [patientId],
    );

    assert.equal(result.rowCount, 1);
    assert.equal(result.rows[0].status, "PENDING");
    assert.equal(result.rows[0].auditCount, "0");
  });
});

test("concurrent patient approvals allow only one success", async () => {
  await withApprovalFixture(async ({ pool, patientId, adminId }) => {
    const attempts = await Promise.allSettled([
      approvePatient(patientId, adminId),
      approvePatient(patientId, adminId),
    ]);
    const winners = attempts.filter(
      (attempt) => attempt.status === "fulfilled",
    );
    const conflicts = attempts.filter(
      (attempt) => attempt.status === "rejected",
    );

    assert.equal(winners.length, 1);
    assert.equal(conflicts.length, 1);
    assert.equal(conflicts[0].status, "rejected");

    if (conflicts[0].status === "rejected") {
      assert.ok(conflicts[0].reason instanceof Error);
      assert.equal(conflicts[0].reason.message, "USER_NOT_PENDING");
    }

    const state = await pool.query<{
      status: string;
      auditCount: string;
    }>(
      `SELECT
         "status",
         (
           SELECT COUNT(*)::text
           FROM "AuditLog"
           WHERE "entity" = 'User' AND "entityId" = $1
         ) AS "auditCount"
       FROM "User"
       WHERE "id" = $1`,
      [patientId],
    );

    assert.equal(state.rowCount, 1);
    assert.equal(state.rows[0].status, "ACTIVE");
    assert.equal(state.rows[0].auditCount, "1");
  });
});
