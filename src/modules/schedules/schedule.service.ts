import {
  createSchedule as createScheduleRecord,
  findScheduleById,
  findSchedules,
  updateSchedule as updateScheduleRecord,
  updateScheduleStatus as updateScheduleStatusRecord,
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

  return updateScheduleStatusRecord(id, status);
}