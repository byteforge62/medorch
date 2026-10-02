import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getOTRooms, createOTRoom } from "@/modules/ot-rooms/ot-room.service";
import { createOTRoomSchema } from "@/modules/ot-rooms/ot-room.validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      ["ADMIN", "DOCTOR", "OT_STAFF"],
      requestId,
    );

    if (!session) {
      return response;
    }

    const otRooms = await getOTRooms();

    return apiSuccess(otRooms, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/ot-rooms error:`,
      error,
    );

    return apiError(
      "Failed to fetch OT rooms.",
      500,
      undefined,
      requestId,
    );
  }
}
export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      "ADMIN",
      requestId,
    );

    if (!session) {
      return response;
    }

    const body = await request.json();

    const validation = createOTRoomSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid OT room data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const otRoom = await createOTRoom(validation.data,session.user.id);

    return apiSuccess(otRoom, 200);
  } catch (error) {
    console.error(
      `[${requestId}] POST /api/ot-rooms error:`,
      error,
    );

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return apiError(
        "An OT room with this code already exists.",
        409,
        undefined,
        requestId,
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2003"
    ) {
      return apiError(
        "The specified department does not exist.",
        400,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to create OT room.",
      500,
      undefined,
      requestId,
    );
  }
}