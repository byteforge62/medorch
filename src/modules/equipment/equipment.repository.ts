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
  return prisma.$transaction(async (tx) => {
    const existing = await tx.equipment.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
      },
    });

    if (!existing) {
      throw new Error("EQUIPMENT_NOT_FOUND");
    }

    const activeAssignments = await tx.scheduleEquipment.count({
      where: {
        equipmentId: id,
        releasedAt: null,
      },
    });

    if (activeAssignments > 0 && status !== "IN_USE") {
      throw new Error("EQUIPMENT_HAS_ACTIVE_ASSIGNMENTS");
    }

    if (activeAssignments === 0 && status === "IN_USE") {
      throw new Error("EQUIPMENT_STATUS_REQUIRES_ASSIGNMENT");
    }

    // Prevent overwriting a status changed by a concurrent request.
    const result = await tx.equipment.updateMany({
      where: {
        id,
        status: existing.status,
      },
      data: { status },
    });

    if (result.count !== 1) {
      throw new Error("EQUIPMENT_STATUS_CONFLICT");
    }

    const updatedEquipment = await tx.equipment.findUnique({
      where: { id },
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

    if (!updatedEquipment) {
      throw new Error("EQUIPMENT_NOT_FOUND");
    }

    return updatedEquipment;
  });
}