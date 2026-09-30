import {prisma} from "@/lib/db/prisma";
import {findOTRoomById,findOTRooms,createOTRoom as createOTRoomRecord, updateOTRoom as updateOTRoomRecord} from "./ot-room.repository";
import type { OTRoomStatus } from "@/generated/prisma/client";

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
}) {
  return createOTRoomRecord(data);
}

export async function updateOTRoomById(
  id: string,
  data: {
    name?: string;
    departmentId?: string;
    capacity?: number | null;
  },
) {
  const existingRoom = await findOTRoomById(id);

  if (!existingRoom) {
    throw new Error("OT_ROOM_NOT_FOUND");
  }

  return updateOTRoomRecord(id, data);
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
) {
  const existingRoom = await findOTRoomById(id);

  if (!existingRoom) {
    throw new Error("OT_ROOM_NOT_FOUND");
  }

  return updateOTRoomStatus(id, status);
}

export async function updateOTRoomActiveById(
  id: string,
  isActive: boolean,
) {
  const existingRoom = await findOTRoomById(id);

  if (!existingRoom) {
    throw new Error("OT_ROOM_NOT_FOUND");
  }

  return updateOTRoomActive(id, isActive);
}