import type {
  WorkspaceSchedule,
  WorkspaceScheduleStatus,
} from "./schedule-workspace.types";

export type ScheduleConflictKind =
  | "ROOM"
  | "SURGEON"
  | "PATIENT"
  | "STAFF"
  | "EQUIPMENT"
  | "INVALID_TIME"
  | "ROOM_UNAVAILABLE"
  | "DEPARTMENT_MISMATCH"
  | "MISSING_RESOURCE"
  | "UNASSIGNED_STAFF";

export type ScheduleConflictSeverity = "CONFIRMED" | "WARNING";

export interface ScheduleConflict {
  id: string;
  kind: ScheduleConflictKind;
  severity: ScheduleConflictSeverity;
  title: string;
  detail: string;
  scheduleIds: string[];
  resourceLabel?: string;
}

type ConflictSchedule = Pick<
  WorkspaceSchedule,
  | "id"
  | "procedure"
  | "startTime"
  | "endTime"
  | "status"
  | "patientId"
  | "departmentId"
  | "otRoomId"
  | "surgeonId"
  | "patient"
  | "otRoom"
  | "surgeon"
  | "staff"
  | "equipment"
>;

const ACTIVE_EXCLUDED: readonly WorkspaceScheduleStatus[] = [
  "CANCELLED",
  "COMPLETED",
];

function isActive(schedule: { status: WorkspaceScheduleStatus }) {
  return !ACTIVE_EXCLUDED.includes(schedule.status);
}

function time(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
}

function clock(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--:--";

  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

function range(schedule: ConflictSchedule) {
  return `${clock(schedule.startTime)}–${clock(schedule.endTime)}`;
}

export function schedulesOverlap(
  first: Pick<ConflictSchedule, "startTime" | "endTime">,
  second: Pick<ConflictSchedule, "startTime" | "endTime">,
) {
  const firstStart = time(first.startTime);
  const firstEnd = time(first.endTime);
  const secondStart = time(second.startTime);
  const secondEnd = time(second.endTime);

  if (
    firstStart === null ||
    firstEnd === null ||
    secondStart === null ||
    secondEnd === null
  ) {
    return false;
  }

  return firstStart < secondEnd && secondStart < firstEnd;
}

function conflictId(
  kind: ScheduleConflictKind,
  resource: string,
  scheduleIds: string[],
) {
  return `${kind}:${resource}:${[...scheduleIds].sort().join(":")}`;
}

function addConflict(
  conflicts: Map<string, ScheduleConflict>,
  conflict: ScheduleConflict,
) {
  if (!conflicts.has(conflict.id)) {
    conflicts.set(conflict.id, conflict);
  }
}

function pairwise(
  schedules: ConflictSchedule[],
  resourceOf: (schedule: ConflictSchedule) => string | null,
  conflictFor: (
    left: ConflictSchedule,
    right: ConflictSchedule,
    resource: string,
  ) => ScheduleConflict,
) {
  const groups = new Map<string, ConflictSchedule[]>();

  for (const schedule of schedules) {
    if (!isActive(schedule)) continue;

    const resource = resourceOf(schedule);
    if (!resource) continue;

    const group = groups.get(resource) ?? [];
    group.push(schedule);
    groups.set(resource, group);
  }

  const result: ScheduleConflict[] = [];

  for (const [resource, group] of groups) {
    for (let index = 0; index < group.length; index += 1) {
      for (
        let otherIndex = index + 1;
        otherIndex < group.length;
        otherIndex += 1
      ) {
        const left = group[index];
        const right = group[otherIndex];

        if (schedulesOverlap(left, right)) {
          result.push(conflictFor(left, right, resource));
        }
      }
    }
  }

  return result;
}

/**
 * Detects the resource problems the UI can prove from the data it has.
 *
 * Theatre, surgeon and patient overlaps are database-enforced. Staff and
 * equipment findings are advisory because the existing service/DB does not
 * enforce those allocations. Warnings are operational facts, not confirmed
 * double-bookings.
 */
export function detectScheduleConflicts(
  schedules: ConflictSchedule[],
): ScheduleConflict[] {
  const conflicts = new Map<string, ScheduleConflict>();

  const roomConflicts = pairwise(
    schedules,
    (schedule) => schedule.otRoomId,
    (left, right, resource) => {
      const room = left.otRoom ?? right.otRoom;
      const label = room ? `${room.code} · ${room.name}` : "Theatre";
      const ids = [left.id, right.id];

      return {
        id: conflictId("ROOM", resource, ids),
        kind: "ROOM",
        severity: "CONFIRMED",
        title: "Theatre double-booked",
        detail: `${label} holds ${left.procedure} (${range(
          left,
        )}) and ${right.procedure} (${range(right)}) at the same time.`,
        scheduleIds: ids,
        resourceLabel: label,
      };
    },
  );

  const surgeonConflicts = pairwise(
    schedules,
    (schedule) => schedule.surgeonId,
    (left, right, resource) => {
      const name = left.surgeon?.name ?? right.surgeon?.name ?? "Surgeon";
      const ids = [left.id, right.id];

      return {
        id: conflictId("SURGEON", resource, ids),
        kind: "SURGEON",
        severity: "CONFIRMED",
        title: "Surgeon double-booked",
        detail: `${name} is assigned to ${left.procedure} (${range(
          left,
        )}) and ${right.procedure} (${range(right)}) at the same time.`,
        scheduleIds: ids,
        resourceLabel: name,
      };
    },
  );

  const patientConflicts = pairwise(
    schedules,
    (schedule) => schedule.patientId,
    (left, right, resource) => {
      const patient =
        left.patient?.name ?? right.patient?.name ?? "The patient";
      const ids = [left.id, right.id];

      return {
        id: conflictId("PATIENT", resource, ids),
        kind: "PATIENT",
        severity: "CONFIRMED",
        title: "Patient double-booked",
        detail: `${patient} appears in ${left.procedure} (${range(
          left,
        )}) and ${right.procedure} (${range(right)}) at the same time.`,
        scheduleIds: ids,
        resourceLabel: patient,
      };
    },
  );

  const staffGroups = new Map<
    string,
    Array<{ schedule: ConflictSchedule; name: string; role: string }>
  >();

  for (const schedule of schedules) {
    if (!isActive(schedule)) continue;

    for (const assignment of schedule.staff) {
      const group = staffGroups.get(assignment.userId) ?? [];
      group.push({
        schedule,
        name: assignment.user.name,
        role: assignment.role,
      });
      staffGroups.set(assignment.userId, group);
    }
  }

  for (const [userId, group] of staffGroups) {
    for (let index = 0; index < group.length; index += 1) {
      for (
        let otherIndex = index + 1;
        otherIndex < group.length;
        otherIndex += 1
      ) {
        const left = group[index];
        const right = group[otherIndex];

        if (
          left.schedule.id === right.schedule.id ||
          !schedulesOverlap(left.schedule, right.schedule)
        ) {
          continue;
        }

        const ids = [left.schedule.id, right.schedule.id];

        addConflict(conflicts, {
          id: conflictId("STAFF", userId, ids),
          kind: "STAFF",
          severity: "CONFIRMED",
          title: "Staff double-allocated",
          detail: `${left.name} is assigned to ${left.schedule.procedure} (${range(
            left.schedule,
          )}) and ${right.schedule.procedure} (${range(
            right.schedule,
          )}) at the same time.`,
          scheduleIds: ids,
          resourceLabel: left.name,
        });
      }
    }
  }

  const equipmentGroups = new Map<
    string,
    Array<{ schedule: ConflictSchedule; name: string }>
  >();

  for (const schedule of schedules) {
    if (!isActive(schedule)) continue;

    for (const assignment of schedule.equipment) {
      if (assignment.releasedAt) continue;

      const group = equipmentGroups.get(assignment.equipmentId) ?? [];
      group.push({ schedule, name: assignment.equipment.name });
      equipmentGroups.set(assignment.equipmentId, group);
    }
  }

  for (const [equipmentId, group] of equipmentGroups) {
    for (let index = 0; index < group.length; index += 1) {
      for (
        let otherIndex = index + 1;
        otherIndex < group.length;
        otherIndex += 1
      ) {
        const left = group[index];
        const right = group[otherIndex];

        if (
          left.schedule.id === right.schedule.id ||
          !schedulesOverlap(left.schedule, right.schedule)
        ) {
          continue;
        }

        const ids = [left.schedule.id, right.schedule.id];

        addConflict(conflicts, {
          id: conflictId("EQUIPMENT", equipmentId, ids),
          kind: "EQUIPMENT",
          severity: "CONFIRMED",
          title: "Equipment double-allocated",
          detail: `${left.name} is assigned to ${left.schedule.procedure} (${range(
            left.schedule,
          )}) and ${right.schedule.procedure} (${range(
            right.schedule,
          )}) at the same time.`,
          scheduleIds: ids,
          resourceLabel: left.name,
        });
      }
    }
  }

  for (const conflict of [
    ...roomConflicts,
    ...surgeonConflicts,
    ...patientConflicts,
  ]) {
    addConflict(conflicts, conflict);
  }

  for (const schedule of schedules) {
    const start = time(schedule.startTime);
    const end = time(schedule.endTime);

    if (start !== null && end !== null && end <= start) {
      addConflict(conflicts, {
        id: conflictId("INVALID_TIME", schedule.id, [schedule.id]),
        kind: "INVALID_TIME",
        severity: "CONFIRMED",
        title: "Invalid time range",
        detail: `${schedule.procedure} ends at or before its recorded start time.`,
        scheduleIds: [schedule.id],
        resourceLabel: schedule.procedure,
      });
    }

    if (!isActive(schedule)) continue;

    if (
      !schedule.otRoom ||
      !schedule.otRoom.isActive ||
      schedule.otRoom.status === "MAINTENANCE" ||
      schedule.otRoom.status === "DISABLED"
    ) {
      addConflict(conflicts, {
        id: conflictId("ROOM_UNAVAILABLE", schedule.otRoomId, [schedule.id]),
        kind: "ROOM_UNAVAILABLE",
        severity: "WARNING",
        title: "Theatre unavailable",
        detail: `${schedule.procedure} is booked into ${
          schedule.otRoom
            ? `${schedule.otRoom.code} (${schedule.otRoom.isActive ? schedule.otRoom.status.toLowerCase() : "offline"})`
            : "an unassigned theatre"
        }.`,
        scheduleIds: [schedule.id],
        resourceLabel: schedule.otRoom?.code ?? "Unassigned",
      });
    }

    if (
      schedule.otRoom &&
      schedule.otRoom.departmentId !== schedule.departmentId
    ) {
      addConflict(conflicts, {
        id: conflictId("DEPARTMENT_MISMATCH", schedule.otRoomId, [
          schedule.id,
        ]),
        kind: "DEPARTMENT_MISMATCH",
        severity: "WARNING",
        title: "Theatre / department mismatch",
        detail: `${schedule.otRoom.code} belongs to a different department than ${schedule.procedure}.`,
        scheduleIds: [schedule.id],
        resourceLabel: schedule.otRoom.code,
      });
    }

    if (!schedule.surgeon || schedule.surgeon.status !== "ACTIVE") {
      addConflict(conflicts, {
        id: conflictId("MISSING_RESOURCE", "surgeon", [schedule.id]),
        kind: "MISSING_RESOURCE",
        severity: "WARNING",
        title: "Surgeon unavailable",
        detail: `${schedule.procedure} does not have an active surgeon recorded.`,
        scheduleIds: [schedule.id],
        resourceLabel: schedule.surgeon?.name ?? "Unassigned",
      });
    }

    if (schedule.staff.length === 0) {
      addConflict(conflicts, {
        id: conflictId("UNASSIGNED_STAFF", schedule.id, [schedule.id]),
        kind: "UNASSIGNED_STAFF",
        severity: "WARNING",
        title: "No staff assigned",
        detail: `${schedule.procedure} has no theatre staff allocation recorded.`,
        scheduleIds: [schedule.id],
        resourceLabel: schedule.procedure,
      });
    }
  }

  return [...conflicts.values()].sort((left, right) => {
    if (left.severity !== right.severity) {
      return left.severity === "CONFIRMED" ? -1 : 1;
    }

    return left.title.localeCompare(right.title);
  });
}

export function conflictsForSchedule(
  conflicts: ScheduleConflict[],
  scheduleId: string,
) {
  return conflicts.filter((conflict) =>
    conflict.scheduleIds.includes(scheduleId),
  );
}
