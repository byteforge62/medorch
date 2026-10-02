import { prisma } from "@/lib/db/prisma";
import { findOTRoomById, findOTRooms, createOTRoom as createOTRoomRecord, updateOTRoom as updateOTRoomRecord } from "./ot-room.repository";
import type { OTRoomStatus } from "@/generated/prisma/client";
import { recordAudit } from "@/modules/audit/audit.service";

export async function getOTRooms() {
  return findOTRooms();
}

export async function getOTRoomById(id: string) {
  return findOTRoomById(id);
}

export async function createOTRoom(data: {
  name: string;
  code: string;
  departmentId: string;
  capacity?: number;
},
  actorUserId: string
) {
  const otRoom = await createOTRoomRecord(data);

  await recordAudit({
    userId: actorUserId,
    action: "CREATE",
    entity: "OTRoom",
    entityId: otRoom.id,
    description: `OT room "${otRoom.name}" was created.`,
    metadata: {
      code: otRoom.code,
      departmentId: otRoom.departmentId,
    },
  });

  return otRoom;
}

export async function updateOTRoomById(
  id: string,
  data: {
    name?: string;
    departmentId?: string;
    capacity?: number | null;
  },
  actorUserId: string
) {
  const existingRoom = await findOTRoomById(id);

  if (!existingRoom) {
    throw new Error("OT_ROOM_NOT_FOUND");
  }

  const otRoom = await updateOTRoomRecord(id, data);

  await recordAudit({
    userId: actorUserId,
    action: "UPDATE",
    entity: "OTRoom",
    entityId: otRoom.id,
    description: `OT room "${otRoom.name}" was updated.`,
    metadata: {
      otRoomId: otRoom.id,
    },
  });

  return otRoom;
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

export async function updateOTRoomStatusById(
  id: string,
  status: OTRoomStatus,
  actorUserId?: string
) {
  const existingRoom = await findOTRoomById(id);

  if (!existingRoom) {
    throw new Error("OT_ROOM_NOT_FOUND");
  }

  const otRoom = await updateOTRoomStatus(id, status);

  await recordAudit({
    userId: actorUserId,
    action: "UPDATE",
    entity: "OTRoom",
    entityId: otRoom.id,
    description: `OT room status changed to ${status}.`,
    metadata: {
      status,
    },
  });

  return otRoom;
}

export async function updateOTRoomActiveById(
  id: string,
  isActive: boolean,
  actorUserId?: string,
) {
  const existingRoom = await findOTRoomById(id);

  if (!existingRoom) {
    throw new Error("OT_ROOM_NOT_FOUND");
  }

  const otRoom = await updateOTRoomActive(id, isActive);

  await recordAudit({
    userId: actorUserId,
    action: "UPDATE",
    entity: "OTRoom",
    entityId: otRoom.id,
    description: `OT room active state changed to ${isActive}.`,
    metadata: {
      isActive,
    },
  });

  return otRoom;
}