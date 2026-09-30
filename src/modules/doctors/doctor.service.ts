import {findDoctorById,findDoctors,createDoctorProfile,findUserForDoctorCreation,updateDoctorProfile,updateDoctorUserStatus} from "./doctor.repository";

export async function getDoctors() {
  return findDoctors();
}

export async function getDoctorById(id: string) {
  return findDoctorById(id);
}

export async function createDoctor(data: {
  userId: string;
  departmentId?: string;
  specialization?: string;
  licenseNumber?: string;
}) {
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

  return createDoctorProfile(data);
}

export async function updateDoctor(
  id: string,
  data: {
    departmentId?: string | null;
    specialization?: string | null;
    licenseNumber?: string | null;
  },
) {
  const existingDoctor = await findDoctorById(id);

  if (!existingDoctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  return updateDoctorProfile(id, data);
}

export async function updateDoctorStatus(doctorId: string,status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED") {
  return updateDoctorUserStatus(doctorId, status);
}