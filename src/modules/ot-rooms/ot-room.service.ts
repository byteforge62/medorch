import {findOTRoomById,findOTRooms,createOTRoom as createOTRoomRecord} from "./ot-room.repository";

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