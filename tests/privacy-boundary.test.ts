import 'dotenv/config';

import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import test from 'node:test';
import { Pool } from 'pg';
import { getPatientPortalData } from '@/modules/patients/patient.service';
import { getSchedulesForStaff } from '@/modules/schedules/schedule.service';

test('staff and patient schedule reads are scoped and return limited fields', async () => {
  const connectionString = process.env.DATABASE_URL;
  assert.ok(connectionString, 'DATABASE_URL must be configured.');

  const pool = new Pool({ connectionString, max: 3 });
  const runId = randomUUID().replaceAll('-', '').slice(0, 12);
  const departmentId = randomUUID();
  const roomId = randomUUID();
  const surgeonId = randomUUID();
  const staffUserIds = [randomUUID(), randomUUID()];
  const patientUserIds = [randomUUID(), randomUUID()];
  const unlinkedPatientUserId = randomUUID();
  const patientIds = [randomUUID(), randomUUID()];
  const scheduleIds = [randomUUID(), randomUUID()];
  let fixturesCommitted = false;

  try {
    const now = new Date();
    const setup = await pool.connect();

    try {
      await setup.query('BEGIN');
      await setup.query(
        `INSERT INTO "Department" ("id", "name", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, TRUE, $3, $3)`,
        [departmentId, `Privacy Boundary ${runId}`, now],
      );
      await setup.query(
        `INSERT INTO "OTRoom" ("id", "name", "code", "departmentId", "status", "isActive", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, 'AVAILABLE', TRUE, $5, $5)`,
        [roomId, 'Privacy Boundary Room', `PB-${runId}`, departmentId, now],
      );

      const users = [
        ...staffUserIds.map((id, index) => ({
          id,
          suffix: `staff-${index}`,
          role: 'OT_STAFF',
        })),
        ...patientUserIds.map((id, index) => ({
          id,
          suffix: `patient-${index}`,
          role: 'PATIENT',
        })),
        {
          id: unlinkedPatientUserId,
          suffix: 'unlinked-patient',
          role: 'PATIENT',
        },
        { id: surgeonId, suffix: 'surgeon', role: 'DOCTOR' },
      ];

      for (const user of users) {
        await setup.query(
          `INSERT INTO "User" ("id", "email", "passwordHash", "name", "role", "status", "createdAt", "updatedAt")
           VALUES ($1, $2, $3, $4, $5, 'ACTIVE', $6, $6)`,
          [
            user.id,
            `privacy-${runId}-${user.suffix}@example.invalid`,
            'test-only-password-hash',
            `Privacy ${user.suffix}`,
            user.role,
            now,
          ],
        );
      }

      for (const [index, patientId] of patientIds.entries()) {
        await setup.query(
          `INSERT INTO "Patient" (
             "id", "patientCode", "userId", "name", "email", "phone", "dateOfBirth",
             "gender", "medicalHistory", "createdAt", "updatedAt"
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $10)`,
          [
            patientId,
            `PB-${runId}-${index}`,
            patientUserIds[index],
            `Privacy Patient ${index}`,
            `patient-${index}@example.invalid`,
            `555-010${index}`,
            new Date('1980-01-01T00:00:00.000Z'),
            'Synthetic',
            'Synthetic confidential history',
            now,
          ],
        );

        const scheduleId = scheduleIds[index];
        const scheduledDate = new Date(`2030-01-0${index + 1}T00:00:00.000Z`);
        await setup.query(
          `INSERT INTO "Schedule" (
             "id", "patientId", "departmentId", "otRoomId", "surgeonId", "createdById",
             "procedure", "scheduledDate", "startTime", "endTime", "status", "priority",
             "clinicalNotes", "createdAt", "updatedAt"
           ) VALUES ($1, $2, $3, $4, $5, $5, $6, $7, $8, $9, 'SCHEDULED', 'ELECTIVE', $10, $11, $11)`,
          [
            scheduleId,
            patientId,
            departmentId,
            roomId,
            surgeonId,
            `Synthetic procedure ${index}`,
            scheduledDate,
            new Date(`2030-01-0${index + 1}T10:00:00.000Z`),
            new Date(`2030-01-0${index + 1}T11:00:00.000Z`),
            'Synthetic confidential clinical notes',
            now,
          ],
        );
        await setup.query(
          `INSERT INTO "ScheduleStaff" ("id", "scheduleId", "userId", "role", "assignedAt")
           VALUES ($1, $2, $3, 'NURSE', $4)`,
          [randomUUID(), scheduleId, staffUserIds[index], now],
        );
      }

      await setup.query('COMMIT');
      fixturesCommitted = true;
    } catch (error) {
      await setup.query('ROLLBACK');
      throw error;
    } finally {
      setup.release();
    }

    const staffAssignments = await getSchedulesForStaff(staffUserIds[0]);
    assert.deepEqual(
      staffAssignments.map(({ schedule }) => schedule.id),
      [scheduleIds[0]],
    );
    assert.deepEqual(Object.keys(staffAssignments[0].schedule).sort(), [
      'department',
      'endTime',
      'id',
      'otRoom',
      'patient',
      'priority',
      'procedure',
      'scheduledDate',
      'startTime',
      'status',
    ]);
    assert.deepEqual(Object.keys(staffAssignments[0].schedule.patient).sort(), [
      'name',
      'patientCode',
    ]);

    const patientPortal = await getPatientPortalData(patientUserIds[0]);
    assert.ok(patientPortal);
    assert.deepEqual(
      patientPortal.schedules.map(({ id }) => id),
      [scheduleIds[0]],
    );
    assert.deepEqual(Object.keys(patientPortal).sort(), [
      'id',
      'name',
      'patientCode',
      'schedules',
    ]);
    assert.deepEqual(Object.keys(patientPortal.schedules[0]).sort(), [
      'department',
      'endTime',
      'id',
      'otRoom',
      'priority',
      'procedure',
      'scheduledDate',
      'startTime',
      'status',
    ]);
    assert.equal(await getPatientPortalData(unlinkedPatientUserId), null);
  } finally {
    try {
      if (fixturesCommitted) {
        await pool.query(`DELETE FROM "Schedule" WHERE "id" = ANY($1)`, [
          scheduleIds,
        ]);
        await pool.query(`DELETE FROM "Patient" WHERE "id" = ANY($1)`, [
          patientIds,
        ]);
        await pool.query(`DELETE FROM "User" WHERE "id" = ANY($1)`, [
          [
            ...staffUserIds,
            ...patientUserIds,
            unlinkedPatientUserId,
            surgeonId,
          ],
        ]);
        await pool.query(`DELETE FROM "OTRoom" WHERE "id" = $1`, [roomId]);
        await pool.query(`DELETE FROM "Department" WHERE "id" = $1`, [
          departmentId,
        ]);
      }
    } finally {
      await pool.end();
    }
  }
});
