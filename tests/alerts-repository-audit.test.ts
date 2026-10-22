import "dotenv/config";

import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import test from "node:test";
import { Pool } from "pg";
import {
  createAlert,
  deleteAlert,
  markAlertAsRead,
  markAllAlertsAsReadForUser,
  updateAlert,
} from "@/modules/alerts/alerts.repository";

test("alert repository mutations and audit records commit or roll back together", async (t) => {
  const connectionString = process.env.DATABASE_URL;
  assert.ok(connectionString, "DATABASE_URL must be configured.");

  const databaseUrl = new URL(connectionString);
  const databaseName = decodeURIComponent(databaseUrl.pathname.slice(1));
  assert.ok(
    ["localhost", "127.0.0.1", "[::1]"].includes(databaseUrl.hostname) &&
      /^medorch_alerts_test_[a-z0-9]+$/.test(databaseName),
    "Alert repository audit tests require a disposable local medorch_alerts_test_* database.",
  );

  const pool = new Pool({ connectionString, max: 3 });
  const runId = randomUUID().replaceAll("-", "").slice(0, 12);
  const ownerId = randomUUID();
  const otherUserId = randomUUID();
  const bulkRollbackUserId = randomUUID();
  const invalidActorId = randomUUID();
  const alertIds = {
    update: randomUUID(),
    read: randomUUID(),
    bulkReadOne: randomUUID(),
    bulkReadTwo: randomUUID(),
    delete: randomUUID(),
    failedUpdate: randomUUID(),
    failedRead: randomUUID(),
    failedBulkOne: randomUUID(),
    failedBulkTwo: randomUUID(),
    failedDelete: randomUUID(),
    crossUser: randomUUID(),
  };
  let fixturesCommitted = false;

  const auditCount = async (entityId: string) => {
    const result = await pool.query<{ count: string }>(
      `SELECT COUNT(*)::text AS count
       FROM "AuditLog"
       WHERE "entity" = 'Alert' AND "entityId" = $1`,
      [entityId],
    );
    return Number(result.rows[0].count);
  };

  try {
    const now = new Date();
    const setup = await pool.connect();

    try {
      await setup.query("BEGIN");
      for (const [id, name] of [
        [ownerId, "Alert Audit Owner"],
        [otherUserId, "Alert Audit Other User"],
        [bulkRollbackUserId, "Alert Audit Bulk Rollback User"],
      ]) {
        await setup.query(
          `INSERT INTO "User" (
             "id", "email", "passwordHash", "name",
             "role", "status", "createdAt", "updatedAt"
           ) VALUES ($1, $2, $3, $4, 'DOCTOR', 'ACTIVE', $5, $5)`,
          [
            id,
            `alert-audit-${runId}-${id}@example.invalid`,
            "test-only-password-hash",
            name,
            now,
          ],
        );
      }

      for (const [name, id] of Object.entries(alertIds)) {
        await setup.query(
          `INSERT INTO "Alert" (
             "id", "userId", "type", "title", "message",
             "severity", "isRead", "readAt", "createdAt"
           ) VALUES ($1, $2, 'SYSTEM', $3, $4, 'INFO', FALSE, NULL, $5)`,
          [
            id,
            name.startsWith("failed")
              ? bulkRollbackUserId
              : name === "crossUser"
                ? otherUserId
                : ownerId,
            `Alert ${name}`,
            "Synthetic alert audit fixture",
            now,
          ],
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

    await t.test("successful alert mutations write audit records", async () => {
      const created = await createAlert(
        {
          userId: ownerId,
          type: "SYSTEM",
          title: "Created alert",
          message: "Created with its audit record.",
        },
        ownerId,
        "Alert Audit Owner",
      );
      assert.equal(await auditCount(created.id), 1);

      const updated = await updateAlert(
        alertIds.update,
        { title: "Updated alert" },
        ownerId,
        ownerId,
      );
      assert.equal(updated?.title, "Updated alert");
      assert.equal(await auditCount(alertIds.update), 1);

      const read = await markAlertAsRead(alertIds.read, ownerId, ownerId);
      assert.equal(read?.isRead, true);
      assert.equal(await auditCount(alertIds.read), 1);

      const repeatedRead = await markAlertAsRead(
        alertIds.read,
        ownerId,
        ownerId,
      );
      assert.equal(repeatedRead?.isRead, true);
      assert.equal(await auditCount(alertIds.read), 1);

      const bulkRead = await markAllAlertsAsReadForUser(ownerId, ownerId);
      assert.equal(bulkRead.count, 5);
      const bulkAudit = await pool.query<{
        metadata: { affectedCount?: number };
      }>(
        `SELECT "metadata"
         FROM "AuditLog"
         WHERE "entity" = 'Alert' AND "entityId" = $1
           AND "metadata"->>'operation' = 'MARK_ALL_READ'`,
        [ownerId],
      );
      assert.equal(bulkAudit.rowCount, 1);
      assert.equal(bulkAudit.rows[0].metadata.affectedCount, 5);
      assert.equal(
        (await markAllAlertsAsReadForUser(ownerId, ownerId)).count,
        0,
      );
      const bulkAuditAfterNoop = await pool.query(
        `SELECT "id"
         FROM "AuditLog"
         WHERE "entity" = 'Alert' AND "entityId" = $1
           AND "metadata"->>'operation' = 'MARK_ALL_READ'`,
        [ownerId],
      );
      assert.equal(bulkAuditAfterNoop.rowCount, 1);

      const deleted = await deleteAlert(alertIds.delete, ownerId, ownerId);
      assert.equal(deleted?.id, alertIds.delete);
      assert.equal(await auditCount(alertIds.delete), 1);
    });

    await t.test(
      "failed audit inserts roll back each alert mutation",
      async () => {
        await assert.rejects(
          createAlert(
            {
              userId: ownerId,
              type: "SYSTEM",
              title: `Create rollback sentinel ${runId}`,
              message: "Must not persist without its audit record.",
            },
            invalidActorId,
            "Alert Audit Owner",
          ),
        );
        const failedCreate = await pool.query(
          `SELECT "id" FROM "Alert" WHERE "title" = $1`,
          [`Create rollback sentinel ${runId}`],
        );
        assert.equal(failedCreate.rowCount, 0);

        await assert.rejects(
          updateAlert(
            alertIds.failedUpdate,
            { title: "This update must roll back" },
            bulkRollbackUserId,
            invalidActorId,
          ),
        );
        const unchanged = await pool.query<{ title: string }>(
          `SELECT "title" FROM "Alert" WHERE "id" = $1`,
          [alertIds.failedUpdate],
        );
        assert.equal(unchanged.rows[0].title, "Alert failedUpdate");
        assert.equal(await auditCount(alertIds.failedUpdate), 0);

        await assert.rejects(
          markAlertAsRead(
            alertIds.failedRead,
            invalidActorId,
            bulkRollbackUserId,
          ),
        );
        const unread = await pool.query<{ isRead: boolean }>(
          `SELECT "isRead" FROM "Alert" WHERE "id" = $1`,
          [alertIds.failedRead],
        );
        assert.equal(unread.rows[0].isRead, false);
        assert.equal(await auditCount(alertIds.failedRead), 0);

        await assert.rejects(
          markAllAlertsAsReadForUser(bulkRollbackUserId, invalidActorId),
        );
        const unreadBulk = await pool.query<{ count: string }>(
          `SELECT COUNT(*)::text AS count
         FROM "Alert"
         WHERE "userId" = $1 AND "isRead" = FALSE`,
          [bulkRollbackUserId],
        );
        assert.equal(unreadBulk.rows[0].count, "5");
        assert.equal(await auditCount(bulkRollbackUserId), 0);

        await assert.rejects(
          deleteAlert(
            alertIds.failedDelete,
            invalidActorId,
            bulkRollbackUserId,
          ),
        );
        const undeleted = await pool.query(
          `SELECT "id" FROM "Alert" WHERE "id" = $1`,
          [alertIds.failedDelete],
        );
        assert.equal(undeleted.rowCount, 1);
        assert.equal(await auditCount(alertIds.failedDelete), 0);
      },
    );

    await t.test("ownership filters prevent cross-user mutations", async () => {
      assert.equal(
        await updateAlert(
          alertIds.crossUser,
          { title: "Unauthorized update" },
          ownerId,
          ownerId,
        ),
        null,
      );
      assert.equal(
        await markAlertAsRead(alertIds.crossUser, ownerId, ownerId),
        null,
      );
      assert.equal(
        await deleteAlert(alertIds.crossUser, ownerId, ownerId),
        null,
      );

      const unchanged = await pool.query<{
        title: string;
        isRead: boolean;
      }>(`SELECT "title", "isRead" FROM "Alert" WHERE "id" = $1`, [
        alertIds.crossUser,
      ]);
      assert.equal(unchanged.rows[0].title, "Alert crossUser");
      assert.equal(unchanged.rows[0].isRead, false);
      assert.equal(await auditCount(alertIds.crossUser), 0);
    });
  } finally {
    try {
      if (fixturesCommitted) {
        await pool.query(
          `DELETE FROM "AuditLog" WHERE "userId" = ANY($1::text[])`,
          [[ownerId, otherUserId, bulkRollbackUserId]],
        );
        await pool.query(
          `DELETE FROM "Alert" WHERE "userId" = ANY($1::text[])`,
          [[ownerId, otherUserId, bulkRollbackUserId]],
        );
        await pool.query(`DELETE FROM "User" WHERE "id" = ANY($1::text[])`, [
          [ownerId, otherUserId, bulkRollbackUserId],
        ]);
      }
    } finally {
      await pool.end();
    }
  }
});
