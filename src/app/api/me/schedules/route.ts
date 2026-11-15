
import { authorizeApiPermission } from "@/server/api/auth";
import { getRequestId } from "@/server/api/request-id";
import { apiError, apiSuccess } from "@/server/api/response";
import { getSchedulesForSurgeon } from "@/server/services/schedule.service";

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

    if (session.user.role !== "DOCTOR") {
      return apiError(
        "Only doctor accounts can access this schedule.",
        403,
        undefined,
        requestId,
      );
    }

    const schedules = await getSchedulesForSurgeon(session.user.id);

    return apiSuccess(schedules, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/me/schedules error:`,
      error,
    );

    return apiError(
      "Failed to fetch your surgical schedules.",
      500,
      undefined,
      requestId,
    );
  }
}
