import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  updateScheduleStatusById,
} from "@/modules/schedules/schedule.service";
import {
  scheduleIdSchema,
  updateScheduleStatusSchema,
} from "@/modules/schedules/schedule.validation";

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
      updateScheduleStatusSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid schedule status.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const schedule = await updateScheduleStatusById(
      idValidation.data.id,
      validation.data.status,
    );

    return apiSuccess(schedule, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/schedules/[id]/status error:`,
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

      if (
        error.message === "INVALID_STATUS_TRANSITION"
      ) {
        return apiError(
          "Invalid schedule status transition.",
          409,
          undefined,
          requestId,
        );
      }
    }

    return apiError(
      "Failed to update schedule status.",
      500,
      undefined,
      requestId,
    );
  }
}