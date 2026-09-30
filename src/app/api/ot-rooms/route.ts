import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getOTRooms } from "@/modules/ot-rooms/ot-room.service";

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