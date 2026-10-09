import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  assignScheduleEquipmentById,
  getScheduleEquipment,
} from "@/modules/schedules/schedule.service";
import {
  assignScheduleEquipmentSchema,
  scheduleIdSchema,
} from "@/modules/schedules/schedule.validation";

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
    const { session, response } = await authorizeApiPermission(
      "schedules:read",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const validation = scheduleIdSchema.safeParse({ id });

    if (!validation.success) {
      return apiError(
        "Invalid schedule ID.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const equipment = await getScheduleEquipment(
      validation.data.id,
    );

    return apiSuccess(equipment, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/schedules/[id]/equipment error:`,
      error,
    );

    if (
      error instanceof Error &&
      error.message === "SCHEDULE_NOT_FOUND"
    ) {
      return apiError(
        "Schedule not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to fetch schedule equipment.",
      500,
      undefined,
      requestId,
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      "schedules:equipment:manage",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const idValidation = scheduleIdSchema.safeParse({ id });

    if (!idValidation.success) {
      return apiError(
        "Invalid schedule ID.",
        400,
        idValidation.error.flatten(),
        requestId,
      );
    }

    const body = await request.json();

    const validation =
      assignScheduleEquipmentSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid equipment assignment.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const equipment =
      await assignScheduleEquipmentById(
        idValidation.data.id,
        validation.data.equipmentId,
        session.user.id
      );

    return apiSuccess(equipment, 200);
  } catch (error) {
    console.error(
      `[${requestId}] POST /api/schedules/[id]/equipment error:`,
      error,
    );

    if (error instanceof Error) {
      if (error.message === "SCHEDULE_NOT_FOUND") {
        return apiError(
          "Schedule not found.",
          404,
          undefined,
          requestId,
        );
      }

      if (error.message === "EQUIPMENT_NOT_FOUND") {
        return apiError(
          "Equipment not found.",
          404,
          undefined,
          requestId,
        );
      }

      if (error.message === "EQUIPMENT_UNAVAILABLE") {
        return apiError(
          "Equipment is not available.",
          409,
          undefined,
          requestId,
        );
      }
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return apiError(
        "This equipment is already assigned to the schedule.",
        409,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to assign schedule equipment.",
      500,
      undefined,
      requestId,
    );
  }
}