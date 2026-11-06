import "server-only";

import type { UserRole } from "@/generated/prisma/client";
import { getDepartments } from "@/modules/departments/department.service";
import { getDoctors } from "@/modules/doctors/doctor.service";
import { getOTRooms } from "@/modules/ot-rooms/ot-room.service";
import { getPatients } from "@/modules/patients/patient.service";
import { findSchedulesForWorkspace } from "./schedule.repository";
import type {
  ScheduleWorkspaceData,
  WorkspaceSchedule,
} from "./schedule-workspace.types";

const WORKSPACE_ROLES: readonly UserRole[] = [
  "ADMIN",
  "DOCTOR",
  "OT_STAFF",
];

function iso(value: Date): string {
  return value.toISOString();
}

function serializeSchedule(
  schedule: Awaited<ReturnType<typeof findSchedulesForWorkspace>>[number],
  role: UserRole,
): WorkspaceSchedule {
  return {
    id: schedule.id,
    patientId: schedule.patientId,
    departmentId: schedule.departmentId,
    otRoomId: schedule.otRoomId,
    surgeonId: schedule.surgeonId,
    procedure: schedule.procedure,
    scheduledDate: iso(schedule.scheduledDate),
    startTime: iso(schedule.startTime),
    endTime: iso(schedule.endTime),
    status: schedule.status,
    priority: schedule.priority,
    clinicalNotes:
      role === "OT_STAFF" ? null : schedule.clinicalNotes,
    patient: schedule.patient
      ? {
          id: schedule.patient.id,
          name: schedule.patient.name,
          patientCode: schedule.patient.patientCode,
        }
      : null,
    department: schedule.department
      ? {
          id: schedule.department.id,
          name: schedule.department.name,
          isActive: schedule.department.isActive,
        }
      : null,
    otRoom: schedule.otRoom
      ? {
          id: schedule.otRoom.id,
          name: schedule.otRoom.name,
          code: schedule.otRoom.code,
          departmentId: schedule.otRoom.departmentId,
          status: schedule.otRoom.status,
          isActive: schedule.otRoom.isActive,
        }
      : null,
    surgeon: schedule.surgeon
      ? {
          id: schedule.surgeon.id,
          name: schedule.surgeon.name,
          status: schedule.surgeon.status,
        }
      : null,
    staff: schedule.staff.map((assignment) => ({
      id: assignment.id,
      userId: assignment.userId,
      role: assignment.role,
      assignedAt: iso(assignment.assignedAt),
      user: {
        id: assignment.user.id,
        name: assignment.user.name,
      },
    })),
    equipment: schedule.equipment.map((assignment) => ({
      id: assignment.id,
      equipmentId: assignment.equipmentId,
      assignedAt: iso(assignment.assignedAt),
      releasedAt: assignment.releasedAt
        ? iso(assignment.releasedAt)
        : null,
      equipment: {
        id: assignment.equipment.id,
        name: assignment.equipment.name,
        category: assignment.equipment.category,
        serialNumber: assignment.equipment.serialNumber,
        status: assignment.equipment.status,
      },
    })),
  };
}

/**
 * The server-side read boundary for the Schedules workspace.
 *
 * It returns only the fields the workspace needs, redacts clinical notes for
 * OT_STAFF, narrows OT_STAFF to assigned cases, and loads reference options
 * only for roles that can edit or create. Writes continue through the
 * existing API contracts.
 */
export async function getScheduleWorkspace(
  user: {
    id: string;
    role: UserRole;
  },
  range?: { from: Date; to: Date },
): Promise<ScheduleWorkspaceData> {
  if (!WORKSPACE_ROLES.includes(user.role)) {
    throw new Error("SCHEDULE_WORKSPACE_FORBIDDEN");
  }

  const role = user.role as ScheduleWorkspaceData["role"];
  const canCreate = role === "ADMIN";
  const canEdit = role === "ADMIN" || role === "DOCTOR";
  const scope = role === "OT_STAFF" ? "ASSIGNED" : "ALL";

  const [scheduleRows, roomRows, departmentRows] = await Promise.all([
    findSchedulesForWorkspace({
      assignedUserId: role === "OT_STAFF" ? user.id : undefined,
      from: range?.from,
      to: range?.to,
    }),
    getOTRooms(),
    getDepartments(),
  ]);

  const [patientRows, doctorRows] = canEdit
    ? await Promise.all([getPatients(), getDoctors()])
    : [[], []];

  const today = new Date();
  const todayKey = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  return {
    role,
    scope,
    schedules: scheduleRows.map((schedule) =>
      serializeSchedule(schedule, user.role),
    ),
    rooms: roomRows
      .map((room) => ({
        id: room.id,
        name: room.name,
        code: room.code,
        departmentId: room.departmentId,
        departmentName: room.department?.name ?? null,
        capacity: room.capacity,
        status: room.status,
        isActive: room.isActive,
      }))
      .sort((left, right) => left.code.localeCompare(right.code)),
    departments: departmentRows
      .map((department) => ({
        id: department.id,
        name: department.name,
        isActive: department.isActive,
      }))
      .sort((left, right) => left.name.localeCompare(right.name)),
    patients: patientRows
      .map((patient) => ({
        id: patient.id,
        name: patient.name,
        patientCode: patient.patientCode,
      }))
      .sort((left, right) => left.name.localeCompare(right.name)),
    doctors: doctorRows
      .filter(
        (doctor) =>
          doctor.user.status === "ACTIVE" &&
          Boolean(doctor.user.id),
      )
      .map((doctor) => ({
        id: doctor.id,
        userId: doctor.userId,
        name: doctor.user.name,
        departmentId: doctor.departmentId,
        specialization: doctor.specialization,
      }))
      .sort((left, right) => left.name.localeCompare(right.name)),
    capabilities: {
      canCreate,
      canEdit,
      canManageStatus: canEdit,
      canManageStaff: role === "ADMIN",
      canManageEquipment: role === "ADMIN",
      canManageNotes: canEdit,
    },
    todayKey,
    generatedAt: new Date().toISOString(),
  };
}
