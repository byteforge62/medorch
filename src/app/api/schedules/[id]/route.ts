import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getScheduleById, updateScheduleWithValidation } from "@/modules/schedules/schedule.service";
import { scheduleIdSchema, updateScheduleSchema } from "@/modules/schedules/schedule.validation";

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

    const schedule = await getScheduleById(
      validation.data.id,
    );

    if (!schedule) {
      return apiError(
        "Schedule not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiSuccess(schedule, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/schedules/[id] error:`,
      error,
    );

    return apiError(
      "Failed to fetch schedule.",
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
    const { session, response } = await authorizeApiPermission(
      "schedules:manage",
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

    const validation = updateScheduleSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid schedule data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const schedule = await updateScheduleWithValidation(
      idValidation.data.id,
      validation.data,
      session.user.id
    );

    return apiSuccess(schedule, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/schedules/[id] error:`,
      error,
    );

    if (error instanceof Error) {
      const messages: Record<string, string> = {
        SCHEDULE_NOT_FOUND: "Schedule not found.",
        SCHEDULE_IMMUTABLE:
          "Completed or cancelled schedules cannot be updated.",
        PATIENT_NOT_FOUND: "Patient not found.",
        DEPARTMENT_NOT_FOUND: "Department not found.",
        DEPARTMENT_INACTIVE: "Department is inactive.",
        OT_ROOM_NOT_FOUND: "OT room not found.",
        OT_ROOM_INACTIVE: "OT room is inactive.",
        OT_ROOM_DEPARTMENT_MISMATCH:
          "OT room does not belong to the selected department.",
        OT_ROOM_UNAVAILABLE:
          "OT room is currently unavailable.",
        SURGEON_NOT_FOUND: "Surgeon not found.",
        INVALID_SURGEON:
          "Selected user is not a doctor.",
        SURGEON_INACTIVE:
          "Selected surgeon is not active.",
        INVALID_TIME_RANGE:
          "End time must be after start time.",
        OT_ROOM_SCHEDULE_CONFLICT:
          "The OT room is already scheduled during this time.",
        SURGEON_SCHEDULE_CONFLICT:
          "The surgeon is already scheduled during this time.",
      };

      const message = messages[error.message];

      if (message) {
        return apiError(
          message,
          error.message === "SCHEDULE_NOT_FOUND"
            ? 404
            : error.message === "SCHEDULE_IMMUTABLE"
              ? 409
              : 400,
          undefined,
          requestId,
        );
      }
    }

    return apiError(
      "Failed to update schedule.",
      500,
      undefined,
      requestId,
    );
  }
}