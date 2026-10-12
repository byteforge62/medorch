
import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getSchedulesForStaff } from "@/modules/schedules/schedule.service";

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

    if (session.user.role !== "OT_STAFF") {
      return apiError(
        "Only OT staff accounts can access staff assignments.",
        403,
        undefined,
        requestId,
      );
    }

    const schedules = await getSchedulesForStaff(session.user.id);

    return apiSuccess(schedules, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/me/staff-schedules error:`,
      error,
    );

    return apiError(
      "Failed to fetch your staff assignments.",
      500,
      undefined,
      requestId,
    );
  }
}
