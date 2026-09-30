import {findDoctorById,findDoctors,createDoctorProfile,findUserForDoctorCreation} from "./doctor.repository";

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