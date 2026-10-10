import {
  findDoctorById,
  findDoctors,
  createDoctorProfile,
  findUserForDoctorCreation,
  updateDoctorProfile,
  updateDoctorUserStatus,
  findDoctorScheduleHistory,
} from "./doctor.repository";

import { recordAudit } from "@/modules/audit/audit.service";

export async function getDoctors() {
  return findDoctors();
}

export async function getDoctorById(id: string) {
  const doctor = await findDoctorById(id);

  if (!doctor) {
    return null;
  }

  const schedules = await findDoctorScheduleHistory(doctor.userId);

  return {
    ...doctor,
    schedules,
  };
}

export async function createDoctor(
  data: {
    userId: string;
    departmentId?: string;
    specialization?: string;
    licenseNumber?: string;
  },
  actorUserId?: string,
) {
  const user = await findUserForDoctorCreation(data.userId);

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  if (user.role !== "DOCTOR") {
    throw new Error("USER_NOT_DOCTOR");
  }

  if (user.doctorProfile) {
    throw new Error("DOCTOR_PROFILE_EXISTS");
  }

  const doctor = await createDoctorProfile(data);

  await recordAudit({
    userId: actorUserId,
    action: "CREATE",
    entity: "DoctorProfile",
    entityId: doctor.id,
    description: `Doctor profile was created for user ${data.userId}.`,
  });

  return doctor;
}

export async function updateDoctor(
  id: string,
  data: {
    departmentId?: string | null;
    specialization?: string | null;
    licenseNumber?: string | null;
  },
  actorUserId?: string,
) {
  const existingDoctor = await findDoctorById(id);

  if (!existingDoctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  const doctor = await updateDoctorProfile(id, data);

  await recordAudit({
    userId: actorUserId,
    action: "UPDATE",
    entity: "DoctorProfile",
    entityId: doctor.id,
    description: `Doctor profile was updated.`,
  });

  return doctor;
}

export async function updateDoctorStatus(
  doctorId: string,
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED",
  actorUserId?: string,
) {
  const doctor = await updateDoctorUserStatus(doctorId, status);

  await recordAudit({
    userId: actorUserId,
    action: "UPDATE",
    entity: "DoctorProfile",
    entityId: doctorId,
    description: `Doctor status was changed to ${status}.`,
    metadata: {
      status,
    },
  });

  return doctor;
}