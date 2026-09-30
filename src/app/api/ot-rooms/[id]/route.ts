import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getOTRoomById, updateOTRoomById } from "@/modules/ot-rooms/ot-room.service";
import { otRoomIdSchema, updateOTRoomSchema } from "@/modules/ot-rooms/ot-room.validation";

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

    const validation = updateOTRoomSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid OT room data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const otRoom = await updateOTRoomById(
      idValidation.data.id,
      validation.data,
    );

    return apiSuccess(otRoom, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/ot-rooms/[id] error:`,
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
      "Failed to update OT room.",
      500,
      undefined,
      requestId,
    );
  }
}