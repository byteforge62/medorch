import { prisma } from "@/lib/db/prisma";
import type {EquipmentStatus} from "@/generated/prisma/client"

export async function findEquipment() {
  return prisma.equipment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      name: true,
      category: true,
      serialNumber: true,
      status: true,
      departmentId: true,
      maintenanceDueAt: true,
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

export async function findEquipmentById(id: string) {
  return prisma.equipment.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      category: true,
      serialNumber: true,
      status: true,
      departmentId: true,
      maintenanceDueAt: true,
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

export async function createEquipment(data: {
  name: string;
  category: string;
  serialNumber?: string;
  departmentId?: string;
  maintenanceDueAt?: Date;
}) {
  return prisma.equipment.create({
    data,
    select: {
      id: true,
      name: true,
      category: true,
      serialNumber: true,
      status: true,
      departmentId: true,
      maintenanceDueAt: true,
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

export async function updateEquipment(
  id: string,
  data: {
    name?: string;
    category?: string;
    serialNumber?: string | null;
    departmentId?: string | null;
    maintenanceDueAt?: Date | null;
  },
) {
  return prisma.equipment.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      category: true,
      serialNumber: true,
      status: true,
      departmentId: true,
      maintenanceDueAt: true,
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

export async function updateEquipmentStatus(
  id: string,
  status: EquipmentStatus,
) {
  return prisma.equipment.update({
    where: { id },
    data: { status },
    select: {
      id: true,
      name: true,
      category: true,
      serialNumber: true,
      status: true,
      departmentId: true,
      maintenanceDueAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}