/**
 * Deterministic fixtures for the browser and API suites.
 *
 * The suite is run through tests/setup/test-env.ts, so DATABASE_URL points at
 * the disposable *_test database. This file still refuses to run against
 * anything that does not look disposable, because a fixture reset deletes
 * every row it can see.
 *
 * Ids are fixed so specs can address records directly; dates are relative to
 * the run so "upcoming", "today" and "past" stay true whenever the suite runs.
 */
import bcrypt from 'bcryptjs';

import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/generated/prisma/client';

import { ACCOUNT_EMAILS, FIXTURE_PASSWORD } from './constants';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL must be configured (through test-env.ts).');
}

const databaseName = new URL(connectionString).pathname.replace(/^\//, '');

if (!/^[a-z0-9_]+_test$/.test(databaseName)) {
  throw new Error(
    `Refusing to seed "${databaseName}": fixtures delete data and require a *_test database.`,
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

export { FIXTURE_PASSWORD };

export const IDS = {
  adminUser: '11111111-1111-4111-8111-111111111111',
  doctorUser: '22222222-2222-4222-8222-222222222222',
  otUser: '33333333-3333-4333-8333-333333333333',
  patientOneUser: '44444444-4444-4444-8444-444444444444',
  patientTwoUser: '55555555-5555-4555-8555-555555555555',
  department: 'a1111111-1111-4111-8111-111111111111',
  doctorProfile: 'a2222222-2222-4222-8222-222222222222',
  roomOne: 'a3333333-3333-4333-8333-333333333333',
  roomTwo: 'a4444444-4444-4444-8444-444444444444',
  equipmentVentilator: 'a5555555-5555-4555-8555-555555555555',
  equipmentDrill: 'a6666666-6666-4666-8666-666666666666',
  equipmentMonitor: 'a7777777-7777-4777-8777-777777777777',
  patientOne: 'b1111111-1111-4111-8111-111111111111',
  patientTwo: 'b2222222-2222-4222-8222-222222222222',
  scheduleTomorrow: 'c1111111-1111-4111-8111-111111111111',
  scheduleFuture: 'c2222222-2222-4222-8222-222222222222',
  scheduleCompleted: 'c3333333-3333-4333-8333-333333333333',
  scheduleInProgress: 'c4444444-4444-4444-8444-444444444444',
  scheduleDelayed: 'c5555555-5555-4555-8555-555555555555',
  scheduleCancelled: 'c6666666-6666-4666-8666-666666666666',
  alertPatientOneUnread: 'd1111111-1111-4111-8111-111111111111',
  alertPatientOneRead: 'd2222222-2222-4222-8222-222222222222',
  alertPatientTwoUnread: 'd3333333-3333-4333-8333-333333333333',
} as const;

export const ACCOUNTS = ACCOUNT_EMAILS;

function localDay(offsetDays: number, hour: number, minute = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  date.setHours(hour, minute, 0, 0);
  return date;
}

/* Calendar dates are stored at UTC noon of the intended local day. The
   dashboards compare the ISO date prefix to a local day key, so midnight in a
   positive-offset zone would otherwise shift the stored day backwards. */
function dayOnly(offsetDays: number) {
  const local = new Date();
  local.setDate(local.getDate() + offsetDays);
  return new Date(
    Date.UTC(local.getFullYear(), local.getMonth(), local.getDate(), 12, 0, 0),
  );
}

async function resetData() {
  // Children first; every delete targets rows this suite created.
  await prisma.alert.deleteMany();
  await prisma.scheduleEquipment.deleteMany();
  await prisma.scheduleStaff.deleteMany();
  await prisma.scheduleNote.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.equipment.deleteMany();
  await prisma.oTRoom.deleteMany();
  await prisma.doctorProfile.deleteMany();
  await prisma.department.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.emailVerificationToken.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.verificationEmailRequest.deleteMany();
  await prisma.user.deleteMany();
}

async function main() {
  await resetData();

  const passwordHash = bcrypt.hashSync(FIXTURE_PASSWORD, 10);
  const now = new Date();

  const users = [
    { id: IDS.adminUser, email: ACCOUNTS.admin, name: 'QA Administrator', role: 'ADMIN' as const },
    { id: IDS.doctorUser, email: ACCOUNTS.doctor, name: 'Dr. QA Surgeon', role: 'DOCTOR' as const },
    { id: IDS.otUser, email: ACCOUNTS.ot, name: 'QA Theatre Nurse', role: 'OT_STAFF' as const },
    { id: IDS.patientOneUser, email: ACCOUNTS.patientOne, name: 'QA Patient One', role: 'PATIENT' as const },
    { id: IDS.patientTwoUser, email: ACCOUNTS.patientTwo, name: 'QA Patient Two', role: 'PATIENT' as const },
  ];

  await prisma.user.createMany({
    data: users.map((user) => ({
      ...user,
      passwordHash,
      status: 'ACTIVE' as const,
      approvedAt: now,
      emailVerifiedAt: now,
    })),
  });

  await prisma.department.create({
    data: {
      id: IDS.department,
      name: 'QA General Surgery',
      description: 'Department created for automated QA fixtures.',
      isActive: true,
    },
  });

  await prisma.doctorProfile.create({
    data: {
      id: IDS.doctorProfile,
      userId: IDS.doctorUser,
      departmentId: IDS.department,
      specialization: 'General Surgery',
      licenseNumber: 'QA-LIC-0001',
    },
  });

  await prisma.oTRoom.createMany({
    data: [
      {
        id: IDS.roomOne,
        name: 'QA Theatre One',
        code: 'QA-OT-01',
        departmentId: IDS.department,
        status: 'AVAILABLE',
        isActive: true,
        capacity: 2,
      },
      {
        id: IDS.roomTwo,
        name: 'QA Theatre Two',
        code: 'QA-OT-02',
        departmentId: IDS.department,
        status: 'MAINTENANCE',
        isActive: true,
        capacity: 2,
      },
    ],
  });

  await prisma.equipment.createMany({
    data: [
      {
        id: IDS.equipmentVentilator,
        name: 'QA Ventilator',
        category: 'Anaesthesia',
        serialNumber: 'QA-EQ-0001',
        status: 'IN_USE',
        departmentId: IDS.department,
      },
      {
        id: IDS.equipmentDrill,
        name: 'QA Drill',
        category: 'Orthopaedic Instruments',
        serialNumber: 'QA-EQ-0002',
        status: 'MAINTENANCE',
        departmentId: IDS.department,
        maintenanceDueAt: localDay(0, 9),
      },
      {
        id: IDS.equipmentMonitor,
        name: 'QA Monitor',
        category: 'Monitoring',
        serialNumber: 'QA-EQ-0003',
        status: 'AVAILABLE',
        departmentId: IDS.department,
      },
    ],
  });

  await prisma.patient.createMany({
    data: [
      {
        id: IDS.patientOne,
        patientCode: 'QA-P-001',
        userId: IDS.patientOneUser,
        name: 'QA Patient One',
        email: ACCOUNTS.patientOne,
        phone: '555-0101',
        dateOfBirth: new Date('1985-03-12T00:00:00.000Z'),
        gender: 'Female',
      },
      {
        id: IDS.patientTwo,
        patientCode: 'QA-P-002',
        userId: IDS.patientTwoUser,
        name: 'QA Patient Two',
        email: ACCOUNTS.patientTwo,
        phone: '555-0102',
        dateOfBirth: new Date('1979-08-04T00:00:00.000Z'),
        gender: 'Male',
      },
    ],
  });

  const baseSchedule = {
    departmentId: IDS.department,
    otRoomId: IDS.roomOne,
    surgeonId: IDS.doctorUser,
    createdById: IDS.adminUser,
    priority: 'ELECTIVE' as const,
  };

  await prisma.schedule.createMany({
    data: [
      {
        ...baseSchedule,
        id: IDS.scheduleTomorrow,
        patientId: IDS.patientOne,
        procedure: 'QA Cholecystectomy',
        scheduledDate: dayOnly(1),
        startTime: localDay(1, 10),
        endTime: localDay(1, 11),
        status: 'CONFIRMED',
      },
      {
        ...baseSchedule,
        id: IDS.scheduleFuture,
        patientId: IDS.patientOne,
        procedure: 'QA Hernia Repair',
        scheduledDate: dayOnly(2),
        startTime: localDay(2, 10),
        endTime: localDay(2, 11),
        status: 'SCHEDULED',
        priority: 'URGENT',
      },
      {
        ...baseSchedule,
        id: IDS.scheduleCompleted,
        patientId: IDS.patientOne,
        procedure: 'QA Completed Repair',
        scheduledDate: dayOnly(-2),
        startTime: localDay(-2, 10),
        endTime: localDay(-2, 11),
        status: 'COMPLETED',
      },
      {
        ...baseSchedule,
        id: IDS.scheduleInProgress,
        patientId: IDS.patientTwo,
        procedure: 'QA Appendectomy',
        scheduledDate: dayOnly(0),
        startTime: localDay(0, 9),
        endTime: localDay(0, 10),
        status: 'IN_PROGRESS',
      },
      {
        ...baseSchedule,
        id: IDS.scheduleDelayed,
        patientId: IDS.patientTwo,
        procedure: 'QA Delayed Fixation',
        scheduledDate: dayOnly(0),
        startTime: localDay(0, 11),
        endTime: localDay(0, 12),
        status: 'DELAYED',
        priority: 'EMERGENCY',
      },
      {
        ...baseSchedule,
        id: IDS.scheduleCancelled,
        patientId: IDS.patientOne,
        procedure: 'QA Cancelled Biopsy',
        scheduledDate: dayOnly(3),
        startTime: localDay(3, 10),
        endTime: localDay(3, 11),
        status: 'CANCELLED',
      },
    ],
  });

  await prisma.scheduleStaff.create({
    data: {
      scheduleId: IDS.scheduleInProgress,
      userId: IDS.otUser,
      role: 'NURSE',
    },
  });

  await prisma.scheduleEquipment.create({
    data: {
      scheduleId: IDS.scheduleInProgress,
      equipmentId: IDS.equipmentVentilator,
    },
  });

  await prisma.alert.createMany({
    data: [
      {
        id: IDS.alertPatientOneUnread,
        userId: IDS.patientOneUser,
        scheduleId: IDS.scheduleTomorrow,
        type: 'SCHEDULE',
        title: 'QA theatre time changed',
        message: 'Your theatre time moved by thirty minutes.',
        severity: 'CRITICAL',
        isRead: false,
      },
      {
        id: IDS.alertPatientOneRead,
        userId: IDS.patientOneUser,
        type: 'SYSTEM',
        title: 'QA preparation note',
        message: 'Please fast from midnight before your procedure.',
        severity: 'INFO',
        isRead: true,
        readAt: now,
      },
      {
        id: IDS.alertPatientTwoUnread,
        userId: IDS.patientTwoUser,
        scheduleId: IDS.scheduleInProgress,
        type: 'RESOURCE',
        title: 'QA other patient alert',
        message: 'This alert belongs to the second patient.',
        severity: 'WARNING',
        isRead: false,
      },
    ],
  });

  console.log(
    `[fixtures] seeded ${users.length} users, 2 rooms, 3 equipment items, 6 schedules, 3 alerts`,
  );
}

main()
  .catch((error) => {
    console.error('[fixtures] seed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
