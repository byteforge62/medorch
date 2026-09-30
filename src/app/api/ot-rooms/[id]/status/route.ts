import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  updateOTRoomStatusById,
} from "@/modules/ot-rooms/ot-room.service";
import {
  otRoomIdSchema,
  updateOTRoomStatusSchema,
} from "@/modules/ot-rooms/ot-room.validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      "ADMIN",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const idValidation = otRoomIdSchema.safeParse({ id });

    if (!idValidation.success) {
      return apiError(
        "Invalid OT room ID.",
        400,
        idValidation.error.flatten(),
        requestId,
      );
    }

    const body = await request.json();

    const validation = updateOTRoomStatusSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid OT room status.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const otRoom = await updateOTRoomStatusById(
      idValidation.data.id,
      validation.data.status,
    );

    return apiSuccess(otRoom, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/ot-rooms/[id]/status error:`,
      error,
    );

    if (
      error instanceof Error &&
      error.message === "OT_ROOM_NOT_FOUND"
    ) {
      return apiError(
        "OT room not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to update OT room status.",
      500,
      undefined,
      requestId,
    );
  }
}