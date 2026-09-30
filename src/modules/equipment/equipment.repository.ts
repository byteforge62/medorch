import { prisma } from "@/lib/db/prisma";

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