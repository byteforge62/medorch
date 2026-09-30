import {findPatientById,findPatients,createPatientRecord,updatePatient} from "./patient.repository";

export async function getPatients() {
  return findPatients();
}

export async function getPatientById(id: string) {
  return findPatientById(id);
}

export async function createPatient(data: {
  patientCode: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  medicalHistory?: string;
}) {
  return createPatientRecord(data);
}

export async function updatePatientById(
  id: string,
  data: {
    name?: string;
    email?: string | null;
    phone?: string | null;
    dateOfBirth?: Date | null;
    gender?: string | null;
    medicalHistory?: string | null;
  },
) {
  const existingPatient = await findPatientById(id);

  if (!existingPatient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  return updatePatient(id, data);
}