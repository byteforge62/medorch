import {
  findEquipment,
  findEquipmentById,
  createEquipment as createEquipmentRecord,
  updateEquipmentStatus as updateEquipmentStatusRecord,
  updateEquipment as updateEquipmentRecord,
} from "./equipment.repository";
import type {EquipmentStatus} from "@/generated/prisma/client";
import { recordAudit } from "@/modules/audit/audit.service";

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
},
 actorUserId?: string
) {
  const equipment = await createEquipmentRecord(data);

  await recordAudit({
    userId: actorUserId,
    action: "CREATE",
    entity: "Equipment",
    entityId: equipment.id,
    description: `Equipment "${equipment.name}" was created.`
  });

  return equipment
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
  actorUserId: string
) {
  const existingEquipment = await findEquipmentById(id);

  if (!existingEquipment) {
    throw new Error("EQUIPMENT_NOT_FOUND");
  }

const equipment = await updateEquipmentRecord(id, data);

await recordAudit({
  userId: actorUserId,
  action: "UPDATE",
  entity: "Equipment",
  entityId: equipment.id,
  description: "Equipment was updated.",
  metadata: {
    equipmentId: equipment.id,
  },
});

return equipment;
}

export async function updateEquipmentStatusById(
  id: string,
  status: EquipmentStatus,
  actorUserId: string
) {
  const existingEquipment = await findEquipmentById(id);

  if (!existingEquipment) {
    throw new Error("EQUIPMENT_NOT_FOUND");
  }

const equipment = await updateEquipmentStatusRecord(id, status);

await recordAudit({
  userId: actorUserId,
  action: "UPDATE",
  entity: "Equipment",
  entityId: equipment.id,
  description: `Equipment status was changed to ${status}.`,
  metadata: {
    status,
  },
});

return equipment;
}