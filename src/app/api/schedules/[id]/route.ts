import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getScheduleById } from "@/modules/schedules/schedule.service";
import { scheduleIdSchema } from "@/modules/schedules/schedule.validation";

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