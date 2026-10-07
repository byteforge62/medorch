import { prisma } from "@/lib/db/prisma";

export async function findPatients() {
  return prisma.patient.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      patientCode: true,
      name:true,
      email:true,
      phone:true,
      dateOfBirth:true,
      gender:true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
        },
      },
    },
  });
}

export async function findPatientById(id: string) {
  return prisma.patient.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      patientCode: true,
      name:true,
      email:true,
      phone:true,
      dateOfBirth:true,
      gender:true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          status: true,
        },
      },
    },
  });
}

export async function createPatientRecord(data: {
  patientCode: string;
  userId?: string;
  name: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  gender?: string;
  medicalHistory?: string;
}) {
  return prisma.patient.create({
    data,
    select: {
      id: true,
      patientCode: true,
      userId: true,
      name: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      medicalHistory: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
        },
      },
    },
  });
}

export async function updatePatient(
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
  return prisma.patient.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      patientCode: true,
      userId: true,
      name: true,
      email: true,
      phone: true,
      dateOfBirth: true,
      gender: true,
      medicalHistory: true,
      createdAt: true,
      updatedAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
          status: true,
        },
      },
    },
  });
}