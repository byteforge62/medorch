import {findDoctorById,findDoctors} from "./doctor.repository";

export async function getDoctors() {
  return findDoctors();
}

export async function getDoctorById(id: string) {
  return findDoctorById(id);
}