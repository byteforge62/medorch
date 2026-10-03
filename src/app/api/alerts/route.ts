import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getAlerts, createAlert } from "@/modules/alerts/alerts.service";
import {
  createAlertSchema,
  getAlertsQuerySchema,
} from "@/modules/alerts/alerts.validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      ["ADMIN", "DOCTOR", "OT_STAFF", "PATIENT"],
      requestId,
    );

    if (!session) {
      return response;
    }

    const { searchParams } = new URL(request.url);
    const rawQuery = {
      userId: searchParams.get("userId") || undefined,
      isRead: searchParams.get("isRead") || undefined,
      severity: searchParams.get("severity") || undefined,
      type: searchParams.get("type") || undefined,
    };

    const validation = getAlertsQuerySchema.safeParse(rawQuery);

    if (!validation.success) {
      return apiError(
        "Invalid query parameters.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const alerts = await getAlerts(validation.data, session.user);

    return apiSuccess(alerts, 200);
  } catch (error) {
    console.error(`[${requestId}] GET /api/alerts error:`, error);

    return apiError("Failed to fetch alerts.", 500, undefined, requestId);
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      ["ADMIN", "DOCTOR", "OT_STAFF"],
      requestId,
    );

    if (!session) {
      return response;
    }

    const body = await request.json();

    const validation = createAlertSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid alert data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const alert = await createAlert(validation.data, session.user.id);

    return apiSuccess(alert, 200);
  } catch (error) {
    console.error(`[${requestId}] POST /api/alerts error:`, error);

    if (error instanceof Error && error.message === "USER_NOT_FOUND") {
      return apiError("Recipient user not found.", 404, undefined, requestId);
    }

    if (error instanceof Error && error.message === "SCHEDULE_NOT_FOUND") {
      return apiError("Referenced schedule not found.", 404, undefined, requestId);
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2003"
    ) {
      return apiError(
        "Invalid foreign key reference.",
        400,
        undefined,
        requestId,
      );
    }

    return apiError("Failed to create alert.", 500, undefined, requestId);
  }
}
