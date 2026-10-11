import { createHash } from "node:crypto";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "@/lib/auth/password";

import { DEMO_SEED_CONFIG } from "./demo-data";

if (process.env.NODE_ENV === "production") {
  throw new Error("Demo seeding is disabled in production.");
}

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString }),
});

/**
 * Deterministic UUIDs let demo-owned records retain their IDs
 * across repeated seed executions.
 */
function stableId(key: string): string {
  const chars = createHash("sha256")
    .update(`medorch-demo:${key}`)
    .digest("hex")
    .slice(0, 32)
    .split("");

  chars[12] = "5";
  chars[16] = (
    (Number.parseInt(chars[16], 16) & 0x3) |
    0x8
  ).toString(16);

  const value = chars.join("");

  return [
    value.slice(0, 8),
    value.slice(8, 12),
    value.slice(12, 16),
    value.slice(16, 20),
    value.slice(20, 32),
  ].join("-");
}

function requiredId(
  map: Map<string, string>,
  key: string,
  entity: string,
): string {
  const id = map.get(key);

  if (!id) {
    throw new Error(`Missing ${entity} configuration reference: ${key}`);
  }

  return id;
}

function ensureSeedOwnership(
  existingId: string | undefined,
  expectedId: string,
  description: string,
  allowExisting = false,
) {
  if (
    existingId &&
    existingId !== expectedId &&
    !allowExisting
  ) {
    throw new Error(
      `${description} already exists but is not owned by this demo seed. ` +
        "No conflicting record was modified. Choose a different unique value in prisma/demo-data.ts if appropriate.",
    );
  }
}

function dateAtOffset(
  anchor: Date,
  dayOffset: number,
  time = "00:00",
): Date {
  const result = new Date(anchor);
  result.setUTCDate(result.getUTCDate() + dayOffset);

  const [hours, minutes] = time.split(":").map(Number);

  if (
    hours === undefined ||
    minutes === undefined ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid demo time: ${time}`);
  }

  result.setUTCHours(hours, minutes, 0, 0);

  return result;
}

function dateOfBirth(value: string): Date {
  const parsed = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`Invalid demo date of birth: ${value}`);
  }

  return parsed;
}

async function main() {
  const anchor = new Date();
  anchor.setUTCHours(0, 0, 0, 0);

  const adminPasswordHash = await hashPassword(
    DEMO_SEED_CONFIG.passwords.admin,
  );

  const demoPasswordHash = await hashPassword(
    DEMO_SEED_CONFIG.passwords.demo,
  );

  const userIds = new Map<string, string>();
  const departmentIds = new Map<string, string>();
  const doctorIds = new Map<string, string>();
  const patientIds = new Map<string, string>();
  const roomIds = new Map<string, string>();
  const equipmentIds = new Map<string, string>();
  const scheduleIds = new Map<string, string>();

  // A shared lookup used by audit-log configuration references.
  const recordIds = new Map<string, string>();

  // 1. Users
  for (const user of DEMO_SEED_CONFIG.users) {
    const expectedId = stableId(`user:${user.key}`);

    const existing = await prisma.user.findUnique({
      where: { email: user.email },
      select: { id: true },
    });

    // Preserve compatibility with the administrator created by the
    // original seed script, whose ID may be different.
    ensureSeedOwnership(
      existing?.id,
      expectedId,
      `User ${user.email}`,
      user.key === "admin",
    );

    const passwordHash =
      user.key === "admin"
        ? adminPasswordHash
        : demoPasswordHash;

    const approvedAt =
      user.status === "ACTIVE" ? new Date(anchor) : null;

    const saved = await prisma.user.upsert({
      where: { email: user.email },
      create: {
        id: expectedId,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        approvedAt,
        passwordHash,
      },
      update: {
        name: user.name,
        phone: user.phone,
        role: user.role,
        status: user.status,
        approvedAt,
        passwordHash,
      },
    });

    userIds.set(user.key, saved.id);
    recordIds.set(user.key, saved.id);
  }

  // 2. Departments
  for (const department of DEMO_SEED_CONFIG.departments) {
    const expectedId = stableId(`department:${department.key}`);

    const existing = await prisma.department.findUnique({
      where: { name: department.name },
      select: { id: true },
    });

    ensureSeedOwnership(
      existing?.id,
      expectedId,
      `Department "${department.name}"`,
    );

    const saved = await prisma.department.upsert({
      where: { name: department.name },
      create: {
        id: expectedId,
        name: department.name,
        description: department.description,
        isActive: department.isActive,
        headDoctorId: null,
      },
      update: {
        description: department.description,
        isActive: department.isActive,
      },
    });

    departmentIds.set(department.key, saved.id);
    recordIds.set(department.key, saved.id);
  }

  // 3. Doctor profiles
  for (const profile of DEMO_SEED_CONFIG.doctorProfiles) {
    const userId = requiredId(
      userIds,
      profile.userKey,
      "user",
    );

    const departmentId = requiredId(
      departmentIds,
      profile.departmentKey,
      "department",
    );

    const expectedId = stableId(`doctor-profile:${profile.key}`);

    const existing = await prisma.doctorProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    ensureSeedOwnership(
      existing?.id,
      expectedId,
      `Doctor profile "${profile.key}"`,
    );

    const saved = await prisma.doctorProfile.upsert({
      where: { userId },
      create: {
        id: expectedId,
        userId,
        departmentId,
        specialization: profile.specialization,
        licenseNumber: profile.licenseNumber,
      },
      update: {
        departmentId,
        specialization: profile.specialization,
        licenseNumber: profile.licenseNumber,
      },
    });

    doctorIds.set(profile.key, saved.id);
    recordIds.set(profile.key, saved.id);
  }

  // 4. Department heads depend on doctor profiles, so set them afterward.
  for (const department of DEMO_SEED_CONFIG.departments) {
    const headDoctorId = requiredId(
      doctorIds,
      department.headDoctorKey,
      "doctor profile",
    );

    await prisma.department.update({
      where: {
        id: requiredId(
          departmentIds,
          department.key,
          "department",
        ),
      },
      data: { headDoctorId },
    });
  }

  // 5. Patients
  for (const patient of DEMO_SEED_CONFIG.patients) {
    const expectedId = stableId(`patient:${patient.key}`);

    const existing = await prisma.patient.findUnique({
      where: { patientCode: patient.patientCode },
      select: { id: true },
    });

    ensureSeedOwnership(
      existing?.id,
      expectedId,
      `Patient ${patient.patientCode}`,
    );

    const userId = patient.userKey
      ? requiredId(userIds, patient.userKey, "user")
      : null;

    const saved = await prisma.patient.upsert({
      where: { patientCode: patient.patientCode },
      create: {
        id: expectedId,
        patientCode: patient.patientCode,
        userId,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: dateOfBirth(patient.dateOfBirth),
        gender: patient.gender,
        medicalHistory: patient.medicalHistory,
      },
      update: {
        userId,
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        dateOfBirth: dateOfBirth(patient.dateOfBirth),
        gender: patient.gender,
        medicalHistory: patient.medicalHistory,
      },
    });

    patientIds.set(patient.key, saved.id);
    recordIds.set(patient.key, saved.id);
  }

  // 6. Operating theatres
  for (const room of DEMO_SEED_CONFIG.rooms) {
    const expectedId = stableId(`room:${room.key}`);

    const existing = await prisma.oTRoom.findUnique({
      where: { code: room.code },
      select: { id: true },
    });

    ensureSeedOwnership(
      existing?.id,
      expectedId,
      `Operating theatre "${room.code}"`,
    );

    const departmentId = requiredId(
      departmentIds,
      room.departmentKey,
      "department",
    );

    const saved = await prisma.oTRoom.upsert({
      where: { code: room.code },
      create: {
        id: expectedId,
        name: room.name,
        code: room.code,
        departmentId,
        capacity: room.capacity,
        status: room.status,
        isActive: room.isActive,
      },
      update: {
        name: room.name,
        departmentId,
        capacity: room.capacity,
        status: room.status,
        isActive: room.isActive,
      },
    });

    roomIds.set(room.key, saved.id);
    recordIds.set(room.key, saved.id);
  }

  // 7. Equipment
  for (const equipment of DEMO_SEED_CONFIG.equipment) {
    const expectedId = stableId(`equipment:${equipment.key}`);

    const existing = await prisma.equipment.findUnique({
      where: { serialNumber: equipment.serialNumber },
      select: { id: true },
    });

    ensureSeedOwnership(
      existing?.id,
      expectedId,
      `Equipment "${equipment.serialNumber}"`,
    );

    const departmentId = requiredId(
      departmentIds,
      equipment.departmentKey,
      "department",
    );

    const maintenanceDueAt =
      equipment.maintenanceDueInDays === null
        ? null
        : dateAtOffset(
            anchor,
            equipment.maintenanceDueInDays,
          );

    const saved = await prisma.equipment.upsert({
      where: { serialNumber: equipment.serialNumber },
      create: {
        id: expectedId,
        name: equipment.name,
        category: equipment.category,
        serialNumber: equipment.serialNumber,
        departmentId,
        status: equipment.status,
        maintenanceDueAt,
      },
      update: {
        name: equipment.name,
        category: equipment.category,
        departmentId,
        status: equipment.status,
        maintenanceDueAt,
      },
    });

    equipmentIds.set(equipment.key, saved.id);
    recordIds.set(equipment.key, saved.id);
  }

  // 8. Schedules
  const scheduleDataByKey = new Map<
    string,
    {
      id: string;
      startTime: Date;
      endTime: Date;
      status: string;
    }
  >();

  for (const schedule of DEMO_SEED_CONFIG.schedules) {
    const id = stableId(`schedule:${schedule.key}`);

    const patientId = requiredId(
      patientIds,
      schedule.patientKey,
      "patient",
    );

    const departmentId = requiredId(
      departmentIds,
      schedule.departmentKey,
      "department",
    );

    const otRoomId = requiredId(
      roomIds,
      schedule.roomKey,
      "operating theatre",
    );

    const surgeonId = requiredId(
      userIds,
      schedule.surgeonKey,
      "surgeon user",
    );

    const createdById = requiredId(
      userIds,
      schedule.createdByKey,
      "creator user",
    );

    const scheduledDate = dateAtOffset(
      anchor,
      schedule.dayOffset,
    );

    const startTime = dateAtOffset(
      anchor,
      schedule.dayOffset,
      schedule.startTime,
    );

    const endTime = new Date(
      startTime.getTime() + schedule.durationMinutes * 60_000,
    );

    if (
      !Number.isFinite(schedule.durationMinutes) ||
      schedule.durationMinutes <= 0
    ) {
      throw new Error(
        `Invalid duration for demo schedule "${schedule.key}".`,
      );
    }

    const saved = await prisma.schedule.upsert({
      where: { id },
      create: {
        id,
        patientId,
        departmentId,
        otRoomId,
        surgeonId,
        createdById,
        procedure: schedule.procedure,
        scheduledDate,
        startTime,
        endTime,
        status: schedule.status,
        priority: schedule.priority,
        clinicalNotes: schedule.clinicalNotes,
      },
      update: {
        patientId,
        departmentId,
        otRoomId,
        surgeonId,
        createdById,
        procedure: schedule.procedure,
        scheduledDate,
        startTime,
        endTime,
        status: schedule.status,
        priority: schedule.priority,
        clinicalNotes: schedule.clinicalNotes,
      },
    });

    scheduleIds.set(schedule.key, saved.id);
    recordIds.set(schedule.key, saved.id);

    scheduleDataByKey.set(schedule.key, {
      id: saved.id,
      startTime,
      endTime,
      status: schedule.status,
    });
  }

  // 9. Staff and equipment assignments
  const equipmentInUse = new Set<string>();
  const occupiedRooms = new Set<string>();

  for (const schedule of DEMO_SEED_CONFIG.schedules) {
    const scheduleId = requiredId(
      scheduleIds,
      schedule.key,
      "schedule",
    );

    const scheduleData = scheduleDataByKey.get(schedule.key);

    if (!scheduleData) {
      throw new Error(
        `Missing schedule timing information for ${schedule.key}.`,
      );
    }

    const isTerminal =
      schedule.status === "COMPLETED" ||
      schedule.status === "CANCELLED";

    if (schedule.status === "IN_PROGRESS") {
      occupiedRooms.add(
        requiredId(roomIds, schedule.roomKey, "room"),
      );
    }

    for (const assignment of schedule.staffAssignments) {
      const userId = requiredId(
        userIds,
        assignment.userKey,
        "staff user",
      );

      await prisma.scheduleStaff.upsert({
        where: {
          scheduleId_userId_role: {
            scheduleId,
            userId,
            role: assignment.role,
          },
        },
        create: {
          id: stableId(
            `schedule-staff:${schedule.key}:${assignment.userKey}:${assignment.role}`,
          ),
          scheduleId,
          userId,
          role: assignment.role,
          assignedAt: scheduleData.startTime,
        },
        update: {
          assignedAt: scheduleData.startTime,
        },
      });
    }

    for (const equipmentKey of schedule.equipmentKeys) {
      const equipmentId = requiredId(
        equipmentIds,
        equipmentKey,
        "equipment",
      );

      await prisma.scheduleEquipment.upsert({
        where: {
          scheduleId_equipmentId: {
            scheduleId,
            equipmentId,
          },
        },
        create: {
          id: stableId(
            `schedule-equipment:${schedule.key}:${equipmentKey}`,
          ),
          scheduleId,
          equipmentId,
          assignedAt: scheduleData.startTime,
          releasedAt: isTerminal ? scheduleData.endTime : null,
        },
        update: {
          assignedAt: scheduleData.startTime,
          releasedAt: isTerminal ? scheduleData.endTime : null,
        },
      });

      if (!isTerminal) {
        equipmentInUse.add(equipmentId);
      }
    }

    for (const note of schedule.notes) {
      const authorId = requiredId(
        userIds,
        note.authorKey,
        "note author",
      );

      await prisma.scheduleNote.upsert({
        where: {
          id: stableId(`schedule-note:${note.key}`),
        },
        create: {
          id: stableId(`schedule-note:${note.key}`),
          scheduleId,
          authorId,
          content: note.content,
        },
        update: {
          scheduleId,
          authorId,
          content: note.content,
        },
      });
    }
  }

  // Keep resource status consistent with demo assignments.
  for (const room of DEMO_SEED_CONFIG.rooms) {
    await prisma.oTRoom.update({
      where: {
        id: requiredId(roomIds, room.key, "room"),
      },
      data: {
        status: occupiedRooms.has(
          requiredId(roomIds, room.key, "room"),
        )
          ? "OCCUPIED"
          : room.status,
      },
    });
  }

  for (const equipment of DEMO_SEED_CONFIG.equipment) {
    const id = requiredId(
      equipmentIds,
      equipment.key,
      "equipment",
    );

    await prisma.equipment.update({
      where: { id },
      data: {
        status: equipmentInUse.has(id)
          ? "IN_USE"
          : equipment.status,
      },
    });
  }

  // 10. Alerts
  for (const alert of DEMO_SEED_CONFIG.alerts) {
    const userId = requiredId(
      userIds,
      alert.userKey,
      "alert recipient",
    );

    const scheduleId = alert.scheduleKey
      ? requiredId(scheduleIds, alert.scheduleKey, "schedule")
      : null;

    const id = stableId(`alert:${alert.key}`);
    const createdAt = dateAtOffset(anchor, alert.dayOffset);

    await prisma.alert.upsert({
      where: { id },
      create: {
        id,
        userId,
        scheduleId,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        isRead: alert.isRead,
        readAt: alert.isRead ? createdAt : null,
        createdAt,
      },
      update: {
        userId,
        scheduleId,
        type: alert.type,
        title: alert.title,
        message: alert.message,
        severity: alert.severity,
        isRead: alert.isRead,
        readAt: alert.isRead ? createdAt : null,
        createdAt,
      },
    });
  }

  // 11. Audit examples
  for (const log of DEMO_SEED_CONFIG.auditLogs) {
    const userId = requiredId(
      userIds,
      log.actorKey,
      "audit actor",
    );

    const entityId = requiredId(
      recordIds,
      log.entityKey,
      "audit entity",
    );

    const id = stableId(`audit:${log.key}`);
    const createdAt = dateAtOffset(anchor, log.dayOffset);

    await prisma.auditLog.upsert({
      where: { id },
      create: {
        id,
        userId,
        action: log.action,
        entity: log.entity,
        entityId,
        description: log.description,
        metadata: { ...log.metadata },
        createdAt,
      },
      update: {
        userId,
        action: log.action,
        entity: log.entity,
        entityId,
        description: log.description,
        metadata: { ...log.metadata },
        createdAt,
      },
    });
  }

  console.log("MedOrch demo data seeded successfully.");
  console.log({
    departments: departmentIds.size,
    users: userIds.size,
    doctorProfiles: doctorIds.size,
    patients: patientIds.size,
    operatingRooms: roomIds.size,
    equipment: equipmentIds.size,
    schedules: scheduleIds.size,
    alerts: DEMO_SEED_CONFIG.alerts.length,
    auditExamples: DEMO_SEED_CONFIG.auditLogs.length,
    adminEmail: "admin@medorch.local",
  });
}

main()
  .catch((error) => {
    console.error("Failed to seed MedOrch demo data:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });