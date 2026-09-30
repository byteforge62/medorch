import {findPatientById,findPatients} from "./patient.repository";

export async function getPatients() {
  return findPatients();
}

export async function getPatientById(id: string) {
  return findPatientById(id);
}