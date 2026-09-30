import { prisma } from "@/lib/db/prisma";

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