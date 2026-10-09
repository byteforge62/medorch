import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { removeScheduleStaffById } from "@/modules/schedules/schedule.service";
import { scheduleIdSchema } from "@/modules/schedules/schedule.validation";

type RouteContext = {
  params: Promise<{
    id: string;
    staffId: string;
  }>;
};

export async function DELETE(
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

    const { id, staffId } = await params;

    const scheduleValidation =
      scheduleIdSchema.safeParse({ id });

    if (!scheduleValidation.success) {
      return apiError(
        "Invalid schedule ID.",
        400,
        scheduleValidation.error.flatten(),
        requestId,
      );
    }

    const staffValidation =
      scheduleIdSchema.safeParse({ id: staffId });

    if (!staffValidation.success) {
      return apiError(
        "Invalid staff assignment ID.",
        400,
        staffValidation.error.flatten(),
        requestId,
      );
    }

    const staff = await removeScheduleStaffById(
      staffValidation.data.id,
      session.user.id
    );

    return apiSuccess(staff, 200);
  } catch (error) {
    console.error(
      `[${requestId}] DELETE /api/schedules/[id]/staff/[staffId] error:`,
      error,
    );

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return apiError(
        "Staff assignment not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to remove schedule staff.",
      500,
      undefined,
      requestId,
    );
  }
}