import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  getAlertById,
  updateAlertById,
  deleteAlertById,
} from "@/modules/alerts/alerts.service";
import {
  alertIdSchema,
  updateAlertSchema,
} from "@/modules/alerts/alerts.validation";

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
      "alerts:read",
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

    const alert = await getAlertById(validation.data.id, session.user);

    return apiSuccess(alert, 200);
  } catch (error) {
    console.error(`[${requestId}] GET /api/alerts/[id] error:`, error);

    if (error instanceof Error && error.message === "ALERT_NOT_FOUND") {
      return apiError("Alert not found.", 404, undefined, requestId);
    }

    if (error instanceof Error && error.message === "FORBIDDEN_ALERT_ACCESS") {
      return apiError(
        "You do not have permission to view this alert.",
        403,
        undefined,
        requestId,
      );
    }

    return apiError("Failed to fetch alert.", 500, undefined, requestId);
  }
}

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

    const idValidation = alertIdSchema.safeParse({ id });

    if (!idValidation.success) {
      return apiError(
        "Invalid alert ID.",
        400,
        idValidation.error.flatten(),
        requestId,
      );
    }

    const body = await request.json();

    const validation = updateAlertSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid alert data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const alert = await updateAlertById(
      idValidation.data.id,
      validation.data,
      session.user,
    );

    return apiSuccess(alert, 200);
  } catch (error) {
    console.error(`[${requestId}] PATCH /api/alerts/[id] error:`, error);

    if (error instanceof Error && error.message === "ALERT_NOT_FOUND") {
      return apiError("Alert not found.", 404, undefined, requestId);
    }

    if (error instanceof Error && error.message === "FORBIDDEN_ALERT_ACCESS") {
      return apiError(
        "You do not have permission to update this alert.",
        403,
        undefined,
        requestId,
      );
    }

    return apiError("Failed to update alert.", 500, undefined, requestId);
  }
}

export async function DELETE(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      ["alerts:delete","alerts:delete:own"],
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

    const result = await deleteAlertById(validation.data.id, session.user);

    return apiSuccess(result, 200);
  } catch (error) {
    console.error(`[${requestId}] DELETE /api/alerts/[id] error:`, error);

    if (error instanceof Error && error.message === "ALERT_NOT_FOUND") {
      return apiError("Alert not found.", 404, undefined, requestId);
    }

    if (error instanceof Error && error.message === "FORBIDDEN_ALERT_ACCESS") {
      return apiError(
        "You do not have permission to delete this alert.",
        403,
        undefined,
        requestId,
      );
    }

    return apiError("Failed to delete alert.", 500, undefined, requestId);
  }
}
