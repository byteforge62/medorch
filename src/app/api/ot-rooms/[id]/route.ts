import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getOTRoomById } from "@/modules/ot-rooms/ot-room.service";
import { otRoomIdSchema } from "@/modules/ot-rooms/ot-room.validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      ["ADMIN", "DOCTOR", "OT_STAFF"],
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const validation = otRoomIdSchema.safeParse({ id });

    if (!validation.success) {
      return apiError(
        "Invalid OT room ID.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const otRoom = await getOTRoomById(validation.data.id);

    if (!otRoom) {
      return apiError(
        "OT room not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiSuccess(otRoom, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/ot-rooms/[id] error:`,
      error,
    );

    return apiError(
      "Failed to fetch OT room.",
      500,
      undefined,
      requestId,
    );
  }
}