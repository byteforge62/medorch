import { authorizeApiPermission } from "@/server/api/auth";
import { getRequestId } from "@/server/api/request-id";
import { apiError, apiSuccess } from "@/server/api/response";
import { readJsonBody } from "@/server/api/validation";
import {
  updateOTRoomActiveById,
} from "@/server/services/ot-room.service";
import {
  otRoomIdSchema,
  updateOTRoomActiveSchema,
} from "@/server/validation/ot-room.validation";

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
    const { session, response } = await authorizeApiPermission(
      "otRooms:manage",
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

    const bodyResult = await readJsonBody(request);
    if (!bodyResult.success) {
      return apiError("Invalid JSON request body.", 400, undefined, requestId);
    }

    const validation = updateOTRoomActiveSchema.safeParse(bodyResult.data);

    if (!validation.success) {
      return apiError(
        "Invalid OT room active state.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const otRoom = await updateOTRoomActiveById(
      idValidation.data.id,
      validation.data.isActive,
      session.user.id
    );

    return apiSuccess(otRoom, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/ot-rooms/[id]/active error:`,
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
      "Failed to update OT room active state.",
      500,
      undefined,
      requestId,
    );
  }
}