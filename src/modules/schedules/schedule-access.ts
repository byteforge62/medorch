import type { ScheduleStatus, UserRole } from "@/generated/prisma/client";

const ALLOWED_STATUS_TRANSITIONS = {
  SCHEDULED: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "DELAYED", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "DELAYED"],
  DELAYED: ["CONFIRMED", "IN_PROGRESS", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
} satisfies Record<ScheduleStatus, readonly ScheduleStatus[]>;

export function isScheduleStatusTransitionAllowed(
  currentStatus: ScheduleStatus,
  nextStatus: ScheduleStatus,
) {
  return ALLOWED_STATUS_TRANSITIONS[currentStatus].some(
    (status) => status === nextStatus,
  );
}

export function canReadIndividualSchedule(
  role: UserRole,
  isAssignedToUser: boolean,
) {
  return role !== "OT_STAFF" || isAssignedToUser;
}

export function redactScheduleClinicalNotes<
  T extends { clinicalNotes: unknown },
>(schedule: T) {
  return {
    ...schedule,
    clinicalNotes: null,
  };
}

export function redactScheduleDetailsForOT<
  T extends {
    clinicalNotes: unknown;
    notes: unknown;
    patient: {
      email: unknown;
      dateOfBirth: unknown;
      gender: unknown;
    };
  },
>(schedule: T) {
  return {
    ...schedule,
    clinicalNotes: null,
    notes: [],
    patient: {
      ...schedule.patient,
      email: null,
      dateOfBirth: null,
      gender: null,
    },
  };
}
