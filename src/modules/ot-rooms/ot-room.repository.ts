import { prisma } from "@/lib/db/prisma";
import type { OTRoomStatus } from "@/generated/prisma/client";

export async function findOTRooms() {
  return prisma.oTRoom.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      code: true,
      departmentId: true,
      capacity: true,
      status: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function findOTRoomById(id: string) {
  return prisma.oTRoom.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      code: true,
      departmentId: true,
      capacity: true,
      status: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function createOTRoom(data: {
  name: string;
  code: string;
  departmentId: string;
  capacity?: number;
}) {
  return prisma.oTRoom.create({
    data,
    select: {
      id: true,
      name: true,
      code: true,
      departmentId: true,
      capacity: true,
      status: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function updateOTRoom(
  id: string,
  data: {
    name?: string;
    departmentId?: string;
    capacity?: number | null;
  },
) {
  return prisma.oTRoom.update({
    where: {
      id,
    },
    data,
    select: {
      id: true,
      name: true,
      code: true,
      departmentId: true,
      capacity: true,
      status: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

export async function updateOTRoomStatus(
  id: string,
  status: OTRoomStatus,
) {
  return prisma.oTRoom.update({
    where: {
      id,
    },
    data: {
      status,
    },
    select: {
      id: true,
      name: true,
      code: true,
      departmentId: true,
      capacity: true,
      status: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateOTRoomActive(
  id: string,
  isActive: boolean,
) {
  return prisma.oTRoom.update({
    where: {
      id,
    },
    data: {
      isActive,
    },
    select: {
      id: true,
      name: true,
      code: true,
      departmentId: true,
      capacity: true,
      status: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}