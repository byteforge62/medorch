import {
  createSchedule as createScheduleRecord,
  findScheduleById,
  findSchedules,
  findSchedulesForSurgeon,
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
  findSchedulesForStaff,
  findUserForStaffAssignment,
  createScheduleEquipment,
  findEquipmentForAssignment,
  findScheduleEquipment,
  releaseScheduleEquipment,
  createScheduleNote,
  deleteScheduleNote,
  findScheduleNoteById,
  findScheduleNotes,
  updateScheduleNote,
  isUserAssignedToSchedule
} from "./schedule.repository";
import { recordAudit } from "@/modules/audit/audit.service";
import { isScheduleStatusTransitionAllowed } from "./schedule-access";

export async function getSchedules() {
  return findSchedules();
}

export async function getSchedulesForSurgeon(userId: string) {
  return findSchedulesForSurgeon(userId);
}

export async function getSchedulesForStaff(userId: string) {
  return findSchedulesForStaff(userId);
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
  actorUserId?: string
) {
  const existingSchedule = await findScheduleById(id);

  if (!existingSchedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  const currentStatus = existingSchedule.status;

  if (!isScheduleStatusTransitionAllowed(currentStatus, status)) {
    throw new Error("INVALID_STATUS_TRANSITION");
  }

  const schedule = await updateScheduleStatusRecord(
    id,
    status,
    currentStatus,
    actorUserId,
  );

  const auditAction =
    status === "COMPLETED"
      ? "COMPLETE"
      : status === "CANCELLED"
        ? "CANCEL"
        : "UPDATE";

  await recordAudit({
    userId: actorUserId,
    action: auditAction,
    entity: "Schedule",
    entityId: schedule.id,
    description: `Schedule status changed to ${status}.`,
    metadata: {
      status,
    },
  });

  return schedule;
}

export async function createScheduleWithValidation(
  data: {
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
  },
  actorUserId?: string
) {
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

  if (data.endTime <= data.startTime) {
    throw new Error("INVALID_TIME_RANGE");
  }

  const conflicts = await findScheduleConflicts({
    patientId: data.patientId,
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

    const patientConflict = conflicts.some(
      (conflict) => conflict.patientId === data.patientId,
    );

    if (patientConflict) {
      throw new Error("PATIENT_SCHEDULE_CONFLICT");
    }
  }
  const schedule = await createScheduleRecord(data);

  await recordAudit({
    userId: actorUserId,
    action: "CREATE",
    entity: "Schedule",
    entityId: schedule.id,
    description: `Schedule for procedure "${schedule.procedure}" was created.`,
    metadata: {
      patientId: schedule.patientId,
      departmentId: schedule.departmentId,
      otRoomId: schedule.otRoomId,
      surgeonId: schedule.surgeonId,
      priority: schedule.priority,
    },
  });

  return schedule;
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
  actorUserId?: string
) {
  const existingSchedule = await findScheduleById(id);

  if (!existingSchedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  if (
    existingSchedule.status === "COMPLETED" ||
    existingSchedule.status === "CANCELLED"
  ) {
    throw new Error("SCHEDULE_IMMUTABLE");
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
    patientId,
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

  const patientConflict = conflicts.some(
    (conflict) => conflict.patientId === patientId,
  );

  if (patientConflict) {
    throw new Error("PATIENT_SCHEDULE_CONFLICT");
  }

  return updateScheduleRecord(id, data, actorUserId);
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
  actorUserId?: string
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

  const doctorRoles = ["SURGEON", "ANESTHETIST"] as const;

  if (doctorRoles.includes(data.role as (typeof doctorRoles)[number])) {
    if (user.role !== "DOCTOR" || !user.doctorProfile) {
      throw new Error("STAFF_ROLE_MISMATCH");
    }
  } else if (user.role !== "OT_STAFF") {
    throw new Error("STAFF_ROLE_MISMATCH");
  }

  const staff = await createScheduleStaff({
    scheduleId,
    userId: data.userId,
    role: data.role,
  },
    actorUserId
  );

  await recordAudit({
    userId: actorUserId,
    action: "CREATE",
    entity: "ScheduleStaff",
    entityId: staff.id,
    description: `Staff member was assigned to schedule ${scheduleId}.`,
    metadata: {
      scheduleId,
      staffUserId: data.userId,
      role: data.role,
    },
  });

  return staff;
}

export async function removeScheduleStaffById(
  scheduleStaffId: string,
  scheduleId: string,
  actorUserId?: string,
) {
  const staff = await deleteScheduleStaff(
  scheduleStaffId,
  scheduleId,
  actorUserId,
);

  return staff;
}

export async function getScheduleEquipment(
  scheduleId: string,
) {
  const schedule = await findScheduleById(scheduleId);

  if (!schedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  return findScheduleEquipment(scheduleId);
}

export async function assignScheduleEquipmentById(
  scheduleId: string,
  equipmentId: string,
  actorUserId?: string
) {
  const schedule = await findScheduleById(scheduleId);

  if (!schedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  const equipment = await findEquipmentForAssignment(
    equipmentId,
  );

  if (!equipment) {
    throw new Error("EQUIPMENT_NOT_FOUND");
  }

  if (equipment.status !== "AVAILABLE") {
    throw new Error("EQUIPMENT_UNAVAILABLE");
  }

  const assignment = await createScheduleEquipment({
    scheduleId,
    equipmentId,
  });

  await recordAudit({
    userId: actorUserId,
    action: "CREATE",
    entity: "ScheduleEquipment",
    entityId: assignment.id,
    description: "Equipment assigned to schedule.",
    metadata: {
      scheduleId,
      equipmentId
    }
  })

  return assignment;
}

export async function releaseScheduleEquipmentById(
  equipmentAssignmentId: string,
  scheduleId: string,
  actorUserId?: string,
) {
  const assignment = await releaseScheduleEquipment(
    equipmentAssignmentId,
    scheduleId,
  );

  await recordAudit({
    userId: actorUserId,
    action: "UPDATE",
    entity: "ScheduleEquipment",
    entityId: assignment.id,
    description: "Equipment released from schedule.",
    metadata: {
      scheduleId: assignment.scheduleId,
      equipmentId: assignment.equipmentId
    }
  })

  return assignment;
}

export async function getScheduleNotes(
  scheduleId: string,
) {
  const schedule = await findScheduleById(scheduleId);

  if (!schedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  return findScheduleNotes(scheduleId);
}

export async function createScheduleNoteById(
  scheduleId: string,
  authorId: string,
  content: string,
) {
  const schedule = await findScheduleById(scheduleId);

  if (!schedule) {
    throw new Error("SCHEDULE_NOT_FOUND");
  }

  const note = await createScheduleNote({
    scheduleId,
    authorId,
    content,
  });

  await recordAudit({
    userId: authorId,
    action: "CREATE",
    entity: "ScheduleNote",
    entityId: note.id,
    description: `Note was added to schedule ${scheduleId}.`,
    metadata: {
      scheduleId,
      authorId,
    },
  });

  return note;
}


export async function updateScheduleNoteById(
  noteId: string,
  scheduleId: string,
  authorId: string,
  content: string,
) {
  const note = await findScheduleNoteById(noteId);

  if (!note || note.scheduleId !== scheduleId) {
    throw new Error("SCHEDULE_NOTE_NOT_FOUND");
  }

  if (note.authorId !== authorId) {
    throw new Error("SCHEDULE_NOTE_FORBIDDEN");
  }

  const updatedNote = await updateScheduleNote(noteId, content);

  await recordAudit({
    userId: authorId,
    action: "UPDATE",
    entity: "ScheduleNote",
    entityId: note.id,
    description: "Schedule note was updated.",
    metadata: { scheduleId: note.scheduleId },
  });

  return updatedNote;
}

export async function deleteScheduleNoteById(
  noteId: string,
  scheduleId: string,
  authorId: string,
) {
  const note = await findScheduleNoteById(noteId);

  if (!note || note.scheduleId !== scheduleId) {
    throw new Error("SCHEDULE_NOTE_NOT_FOUND");
  }

  if (note.authorId !== authorId) {
    throw new Error("SCHEDULE_NOTE_FORBIDDEN");
  }

  await deleteScheduleNote(noteId);

  await recordAudit({
    userId: authorId,
    action: "DELETE",
    entity: "ScheduleNote",
    entityId: note.id,
    description: "Schedule note was deleted.",
    metadata: { scheduleId: note.scheduleId },
  });

  return note;
}

export async function isScheduleAssignedToUser(
  scheduleId: string,
  userId: string,
) {
  return isUserAssignedToSchedule(scheduleId, userId);
}