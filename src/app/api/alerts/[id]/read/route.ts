import { authorizeApiPermission } from "@/server/api/auth";
import { getRequestId } from "@/server/api/request-id";
import { apiError, apiSuccess } from "@/server/api/response";
import { markAlertAsReadById } from "@/server/services/alerts.service";
import { alertIdSchema } from "@/server/validation/alerts.validation";

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
    const { session, response } = await authorizeApiPermission(
      ["alerts:update","alerts:update:own"],
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const validation = alertIdSchema.safeParse({ id });

    if (!validation.success) {
      return apiError(
        "Invalid alert ID.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const alert = await markAlertAsReadById(validation.data.id, session.user);

    return apiSuccess(alert, 200);
  } catch (error) {
    console.error(`[${requestId}] PATCH /api/alerts/[id]/read error:`, error);

    if (error instanceof Error && error.message === "ALERT_NOT_FOUND") {
      return apiError("Alert not found.", 404, undefined, requestId);
    }

    if (error instanceof Error && error.message === "FORBIDDEN_ALERT_ACCESS") {
      return apiError(
        "You do not have permission to modify this alert.",
        403,
        undefined,
        requestId,
      );
    }

    return apiError("Failed to mark alert as read.", 500, undefined, requestId);
  }
}
