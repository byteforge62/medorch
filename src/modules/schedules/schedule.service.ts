import {
  createSchedule as createScheduleRecord,
  findScheduleById,
  findSchedules,
  updateSchedule as updateScheduleRecord,
  updateScheduleStatus as updateScheduleStatusRecord,
  findOTRoomForSchedule,
  findPatientById,
  findDepartmentById,
  findSurgeonById,
  findScheduleConflicts,
  createScheduleStaff,
  deleteScheduleStaff,
  findScheduleStaff,
  findUserForStaffAssignment
} from "./schedule.repository";

export async function getSchedules() {
  return findSchedules();
}

export async function getScheduleById(id: string) {
  return findScheduleById(id);
}

export async function createSchedule(data: {
  patientId: string;
  departmentId: string;
  otRoomId: string;
  surgeonId: string;
  createdById: string;
  procedure: string;
  scheduledDate: Date;
  startTime: Date;
  endTime: Date;
  priority?:
    | "ELECTIVE"
    | "URGENT"
    | "EMERGENCY";
  clinicalNotes?: string;
}) {
  return createScheduleRecord(data);
}

export async function updateScheduleById(
  id: string,
  data: {
    patientId?: string;
    departmentId?: string;
    otRoomId?: string;
    surgeonId?: string;
    procedure?: string;
    scheduledDate?: Date;
    startTime?: Date;
    endTime?: Date;
    priority?:
      | "ELECTIVE"
      | "URGENT"
      | "EMERGENCY";
    clinicalNotes?: string | null;
  },
) {
  const existingSchedule = await findScheduleById(id);

  if (!existingSchedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  return updateScheduleRecord(id, data);
}

export async function updateScheduleStatusById(
  id: string,
  status:
    | "SCHEDULED"
    | "CONFIRMED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "CANCELLED"
    | "DELAYED",
) {
  const existingSchedule = await findScheduleById(id);

  if (!existingSchedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  const currentStatus = existingSchedule.status;

  const allowedTransitions: Record<
    typeof currentStatus,
    string[]
  > = {
    SCHEDULED: [
      "CONFIRMED",
      "CANCELLED",
    ],

    CONFIRMED: [
      "IN_PROGRESS",
      "DELAYED",
      "CANCELLED",
    ],

    IN_PROGRESS: [
      "COMPLETED",
      "DELAYED",
    ],

    DELAYED: [
      "CONFIRMED",
      "IN_PROGRESS",
      "CANCELLED",
    ],

    COMPLETED: [],

    CANCELLED: [],
  };

  if (!allowedTransitions[currentStatus].includes(status)) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  return updateScheduleStatusRecord(id, status);
}

export async function createScheduleWithValidation(data: {
  patientId: string;
  departmentId: string;
  otRoomId: string;
  surgeonId: string;
  createdById: string;
  procedure: string;
  scheduledDate: Date;
  startTime: Date;
  endTime: Date;
  priority?:
    | "ELECTIVE"
    | "URGENT"
    | "EMERGENCY";
  clinicalNotes?: string;
}) {
  const patient = await findPatientById(data.patientId);

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  const department = await findDepartmentById(
    data.departmentId,
  );

  if (!department) {
    throw new Error("DEPARTMENT_NOT_FOUND");
  }

  if (!department.isActive) {
    throw new Error("DEPARTMENT_INACTIVE");
  }

  const otRoom = await findOTRoomForSchedule(
    data.otRoomId,
  );

  if (!otRoom) {
    throw new Error("OT_ROOM_NOT_FOUND");
  }

  if (!otRoom.isActive) {
    throw new Error("OT_ROOM_INACTIVE");
  }

  if (otRoom.departmentId !== data.departmentId) {
    throw new Error("OT_ROOM_DEPARTMENT_MISMATCH");
  }

  if (otRoom.status === "MAINTENANCE") {
    throw new Error("OT_ROOM_MAINTENANCE");
  }

  if (otRoom.status === "DISABLED") {
    throw new Error("OT_ROOM_DISABLED");
  }

  const surgeon = await findSurgeonById(
    data.surgeonId,
  );

  if (!surgeon) {
    throw new Error("SURGEON_NOT_FOUND");
  }

  if (surgeon.role !== "DOCTOR") {
    throw new Error("INVALID_SURGEON");
  }

  if (surgeon.status !== "ACTIVE") {
    throw new Error("SURGEON_INACTIVE");
  }

  const conflicts = await findScheduleConflicts({
  otRoomId: data.otRoomId,
  surgeonId: data.surgeonId,
  startTime: data.startTime,
  endTime: data.endTime,
});

if (conflicts.length > 0) {
  const roomConflict = conflicts.some(
    (conflict) => conflict.otRoomId === data.otRoomId,
  );

  if (roomConflict) {
    throw new Error("OT_ROOM_SCHEDULE_CONFLICT");
  }

  const surgeonConflict = conflicts.some(
    (conflict) => conflict.surgeonId === data.surgeonId,
  );

  if (surgeonConflict) {
    throw new Error("SURGEON_SCHEDULE_CONFLICT");
  }
}
   
  return createScheduleRecord(data);
}

export async function updateScheduleWithValidation(
  id: string,
  data: {
    patientId?: string;
    departmentId?: string;
    otRoomId?: string;
    surgeonId?: string;
    procedure?: string;
    scheduledDate?: Date;
    startTime?: Date;
    endTime?: Date;
    priority?:
      | "ELECTIVE"
      | "URGENT"
      | "EMERGENCY";
    clinicalNotes?: string | null;
  },
) {
  const existingSchedule = await findScheduleById(id);

  if (!existingSchedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  const patientId =
    data.patientId ?? existingSchedule.patientId;

  const departmentId =
    data.departmentId ?? existingSchedule.departmentId;

  const otRoomId =
    data.otRoomId ?? existingSchedule.otRoomId;

  const surgeonId =
    data.surgeonId ?? existingSchedule.surgeonId;

  const startTime =
    data.startTime ?? existingSchedule.startTime;

  const endTime =
    data.endTime ?? existingSchedule.endTime;

  const patient = await findPatientById(patientId);

  if (!patient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  const department = await findDepartmentById(departmentId);

  if (!department) {
    throw new Error("DEPARTMENT_NOT_FOUND");
  }

  if (!department.isActive) {
    throw new Error("DEPARTMENT_INACTIVE");
  }

  const otRoom = await findOTRoomForSchedule(otRoomId);

  if (!otRoom) {
    throw new Error("OT_ROOM_NOT_FOUND");
  }

  if (!otRoom.isActive) {
    throw new Error("OT_ROOM_INACTIVE");
  }

  if (otRoom.departmentId !== departmentId) {
    throw new Error("OT_ROOM_DEPARTMENT_MISMATCH");
  }

  if (
    otRoom.status === "MAINTENANCE" ||
    otRoom.status === "DISABLED"
  ) {
    throw new Error("OT_ROOM_UNAVAILABLE");
  }

  const surgeon = await findSurgeonById(surgeonId);

  if (!surgeon) {
    throw new Error("SURGEON_NOT_FOUND");
  }

  if (surgeon.role !== "DOCTOR") {
    throw new Error("INVALID_SURGEON");
  }

  if (surgeon.status !== "ACTIVE") {
    throw new Error("SURGEON_INACTIVE");
  }

  if (endTime <= startTime) {
    throw new Error("INVALID_TIME_RANGE");
  }

  const conflicts = await findScheduleConflicts({
    otRoomId,
    surgeonId,
    startTime,
    endTime,
    excludeScheduleId: id,
  });

  if (conflicts.length > 0) {
    const roomConflict = conflicts.some(
      (conflict) => conflict.otRoomId === otRoomId,
    );

    if (roomConflict) {
      throw new Error("OT_ROOM_SCHEDULE_CONFLICT");
    }

    const surgeonConflict = conflicts.some(
      (conflict) => conflict.surgeonId === surgeonId,
    );

    if (surgeonConflict) {
      throw new Error("SURGEON_SCHEDULE_CONFLICT");
    }
  }

  return updateScheduleRecord(id, data);
}

export async function getScheduleStaff(
  scheduleId: string,
) {
  const schedule = await findScheduleById(scheduleId);

  if (!schedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  return findScheduleStaff(scheduleId);
}

export async function assignScheduleStaffById(
  scheduleId: string,
  data: {
    userId: string;
    role:
      | "SURGEON"
      | "NURSE"
      | "ANESTHETIST"
      | "TECHNICIAN"
      | "OTHER";
  },
) {
  const schedule = await findScheduleById(scheduleId);

  if (!schedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  const user = await findUserForStaffAssignment(
    data.userId,
  );

  if (!user) {
    throw new Error("STAFF_USER_NOT_FOUND");
  }

  if (user.status !== "ACTIVE") {
    throw new Error("STAFF_USER_INACTIVE");
  }

  return createScheduleStaff({
    scheduleId,
    userId: data.userId,
    role: data.role,
  });
}

export async function removeScheduleStaffById(
  scheduleStaffId: string,
) {
  return deleteScheduleStaff(scheduleStaffId);
}