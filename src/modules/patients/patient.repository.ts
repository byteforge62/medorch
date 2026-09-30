import { prisma } from "@/lib/db/prisma";

export async function findPatients() {
  return prisma.patient.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      patientCode: true,
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