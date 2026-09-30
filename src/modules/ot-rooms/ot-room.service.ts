import {findOTRoomById,findOTRooms,createOTRoom as createOTRoomRecord, updateOTRoom as updateOTRoomRecord} from "./ot-room.repository";

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