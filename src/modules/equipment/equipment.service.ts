import {
  findEquipment,
  findEquipmentById,
  createEquipment as createEquipmentRecord,
  updateEquipmentStatus as updateEquipmentStatusRecord,
  updateEquipment as updateEquipmentRecord,
} from "./equipment.repository";
import type {EquipmentStatus} from "@/generated/prisma/client";

export async function getEquipment() {
  return findEquipment();
}

export async function getEquipmentById(id: string) {
  return findEquipmentById(id);
}

export async function createEquipment(data: {
  name: string;
  category: string;
  serialNumber?: string;
  departmentId?: string;
  maintenanceDueAt?: Date;
}) {
  return createEquipmentRecord(data);
}

export async function updateEquipmentById(
  id: string,
  data: {
    name?: string;
    category?: string;
    serialNumber?: string | null;
    departmentId?: string | null;
    maintenanceDueAt?: Date | null;
  },
) {
  const existingEquipment = await findEquipmentById(id);

  if (!existingEquipment) {
    throw new Error("EQUIPMENT_NOT_FOUND");
  }

  return updateEquipmentRecord(id, data);
}

export async function updateEquipmentStatusById(
  id: string,
  status: EquipmentStatus,
) {
  const existingEquipment = await findEquipmentById(id);

  if (!existingEquipment) {
    throw new Error("EQUIPMENT_NOT_FOUND");
  }

  return updateEquipmentStatusRecord(id, status);
}