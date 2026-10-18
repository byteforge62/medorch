import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { readJsonBody } from "@/lib/api/validation";
import {
  canReadIndividualSchedule,
} from "@/modules/schedules/schedule-access";
import {
  assignScheduleStaffById,
  getScheduleStaff,
  isScheduleAssignedToUser,
} from "@/modules/schedules/schedule.service";
import {
  assignScheduleStaffSchema,
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

    const idValidation = scheduleIdSchema.safeParse({ id });

    if (!idValidation.success) {
      return apiError(
        "Invalid schedule ID.",
        400,
        idValidation.error.flatten(),
        requestId,
      );
    }

    const isAssigned =
      session.user.role === "OT_STAFF" &&
      (await isScheduleAssignedToUser(
        idValidation.data.id,
        session.user.id,
      ));

    if (!canReadIndividualSchedule(session.user.role, isAssigned)) {
      return apiError("Schedule not found.", 404, undefined, requestId);
    }

    const staff = await getScheduleStaff(
      idValidation.data.id,
    );

    return apiSuccess(staff, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/schedules/[id]/staff error:`,
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
      "Failed to fetch schedule staff.",
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
      "schedules:staff:manage",
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

    const bodyResult = await readJsonBody(request);
    if (!bodyResult.success) {
      return apiError("Invalid JSON request body.", 400, undefined, requestId);
    }

    const validation =
      assignScheduleStaffSchema.safeParse(bodyResult.data);

    if (!validation.success) {
      return apiError(
        "Invalid staff assignment.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const staff = await assignScheduleStaffById(
      idValidation.data.id,
      validation.data,
      session.user.id
    );

    return apiSuccess(staff, 200);
  } catch (error) {
    console.error(
      `[${requestId}] POST /api/schedules/[id]/staff error:`,
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

      if (error.message === "STAFF_USER_NOT_FOUND") {
        return apiError(
          "Staff user not found.",
          404,
          undefined,
          requestId,
        );
      }

      if (error.message === "STAFF_USER_INACTIVE") {
        return apiError(
          "Staff user is inactive.",
          400,
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
        "This user is already assigned to the schedule with this role.",
        409,
        undefined,
        requestId,
      );
    }

    if (error instanceof Error && error.message === "STAFF_ROLE_MISMATCH") {
      return apiError(
        "User account role is incompatible with the requested staff role.",
        400,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to assign schedule staff.",
      500,
      undefined,
      requestId,
    );
  }
}