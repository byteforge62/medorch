import { prisma } from "@/lib/db/prisma";

export async function findDoctors() {
  return prisma.doctorProfile.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      userId: true,
      departmentId: true,
      specialization: true,
      licenseNumber: true,
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

      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function findDoctorById(id: string) {
  return prisma.doctorProfile.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      userId: true,
      departmentId: true,
      specialization: true,
      licenseNumber: true,
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

      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}