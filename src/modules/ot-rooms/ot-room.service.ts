import {findOTRoomById,findOTRooms} from "./ot-room.repository";

export async function getOTRooms() {
  return findOTRooms();
}

export async function getOTRoomById(id: string) {
  return findOTRoomById(id);
}