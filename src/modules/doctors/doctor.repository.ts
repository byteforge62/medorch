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

export async function createDoctorProfile(data: {
  userId: string;
  departmentId?: string;
  specialization?: string;
  licenseNumber?: string;
}) {
  return prisma.doctorProfile.create({
    data: {
      userId: data.userId,
      departmentId: data.departmentId,
      specialization: data.specialization,
      licenseNumber: data.licenseNumber,
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
          role: true,
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

export async function findUserForDoctorCreation(userId: string) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      role: true,
      doctorProfile: {
        select: {
          id: true,
        },
      },
    },
  });
}

export async function updateDoctorProfile(
  id: string,
  data: {
    departmentId?: string | null;
    specialization?: string | null;
    licenseNumber?: string | null;
  },
) {
  return prisma.doctorProfile.update({
    where: {
      id,
    },
    data,
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
          role: true,
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

export async function updateDoctorUserStatus(
  doctorId: string,
  status: "PENDING" | "ACTIVE" | "SUSPENDED" | "REJECTED",
) {
  const doctor = await prisma.doctorProfile.findUnique({
    where: {
      id: doctorId,
    },
    select: {
      userId: true,
    },
  });

  if (!doctor) {
    throw new Error("DOCTOR_NOT_FOUND");
  }

  return prisma.user.update({
    where: {
      id: doctor.userId,
    },
    data: {
      status,
      ...(status === "ACTIVE"
        ? { approvedAt: new Date() }
        : {}),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      status: true,
      approvedAt: true,
      updatedAt: true,
    },
  });
}