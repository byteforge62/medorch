import { getScheduleConstraintConflictMessage } from "@/modules/schedules/schedule-conflict-error";
import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getSchedules, createScheduleWithValidation, getSchedulesForStaff } from "@/modules/schedules/schedule.service";
import { createScheduleSchema } from "@/modules/schedules/schedule.validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      "schedules:read",
      requestId,
    );

    if (!session) {
      return response;
    }

    if (session.user.role === "OT_STAFF") {
      const assignments = await getSchedulesForStaff(session.user.id);

      const schedules = assignments.map(({ schedule }) => ({
        ...schedule,
        clinicalNotes: null,
      }));

      return apiSuccess(schedules, 200);
    }

    const schedules = await getSchedules();

    return apiSuccess(schedules, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/schedules error:`,
      error,
    );

    return apiError(
      "Failed to fetch schedules.",
      500,
      undefined,
      requestId,
    );
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      "schedules:create",
      requestId,
    );

    if (!session) {
      return response;
    }

    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return apiError(
        "Invalid JSON request body.",
        400,
        undefined,
        requestId,
      );
    }
    const validation = createScheduleSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid schedule data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const schedule = await createScheduleWithValidation({
      ...validation.data,
      createdById: session.user.id,
    },
      session.user.id
    );

    return apiSuccess(schedule, 200);
  } catch (error) {
    console.error(
      `[${requestId}] POST /api/schedules error:`,
      error,
    );

    const conflictMessage = getScheduleConstraintConflictMessage(error);

    if (conflictMessage) {
      return apiError(
        conflictMessage,
        409,
        undefined,
        requestId,
      );
    }

    if (error instanceof Error) {
      const messages: Record<string, string> = {
        PATIENT_NOT_FOUND: "Patient not found.",
        DEPARTMENT_NOT_FOUND: "Department not found.",
        DEPARTMENT_INACTIVE: "Department is inactive.",
        OT_ROOM_NOT_FOUND: "OT room not found.",
        OT_ROOM_INACTIVE: "OT room is inactive.",
        OT_ROOM_DEPARTMENT_MISMATCH:
          "OT room does not belong to the selected department.",
        OT_ROOM_MAINTENANCE:
          "OT room is currently under maintenance.",
        OT_ROOM_DISABLED:
          "OT room is disabled.",
        SURGEON_NOT_FOUND: "Surgeon not found.",
        INVALID_SURGEON:
          "Selected user is not a doctor.",
        SURGEON_INACTIVE:
          "Selected surgeon is not active.",
        OT_ROOM_SCHEDULE_CONFLICT:
          "The selected OT room is already scheduled during this time.",
        SURGEON_SCHEDULE_CONFLICT:
          "The selected surgeon is already scheduled during this time.",
        INVALID_TIME_RANGE:
          "End time must be later than start time.",
      };

      const message = messages[error.message];

      if (message) {
        return apiError(
          message,
          [
            "OT_ROOM_SCHEDULE_CONFLICT",
            "SURGEON_SCHEDULE_CONFLICT",
          ].includes(error.message)
            ? 409
            : 400,
          undefined,
          requestId,
        );
      }
    }

    if (
      error instanceof Error &&
      error.message === "PATIENT_SCHEDULE_CONFLICT"
    ) {
      return apiError(
        "This patient already has a procedure scheduled during the selected time.",
        409,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to create schedule.",
      500,
      undefined,
      requestId,
    );
  }
}