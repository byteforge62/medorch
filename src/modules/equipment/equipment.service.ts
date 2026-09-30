import {
  findEquipment,
  findEquipmentById,
} from "./equipment.repository";

export async function getEquipment() {
  return findEquipment();
}

export async function getEquipmentById(id: string) {
  return findEquipmentById(id);
}