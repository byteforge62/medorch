import {
  findEquipment,
  findEquipmentById,
  createEquipment as createEquipmentRecord
} from "./equipment.repository";

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