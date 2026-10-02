import { findPatientById, findPatients, createPatientRecord, updatePatient } from "./patient.repository";
import { recordAudit } from "@/modules/audit/audit.service";

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
},
  actorUserId: string
) {
  const patient = await createPatientRecord(data);

  await recordAudit({
    userId: actorUserId,
    action: "CREATE",
    entity: "Patient",
    entityId: patient.id,
    description: "Patient record created.",
    metadata: {
      patientCode: patient.patientCode
    }
  });

  return patient;
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
  actorUserId: string
) {
  const existingPatient = await findPatientById(id);

  if (!existingPatient) {
    throw new Error("PATIENT_NOT_FOUND");
  }

  const patient = await updatePatient(id, data);

  await recordAudit({
    userId: actorUserId,
    action: "UPDATE",
    entity: "Patient",
    entityId: patient.id,
    description: `Patient "${patient.name}" was updated.`,
    metadata: {
      patientId: patient.id,
    },
  });

  return patient;
}