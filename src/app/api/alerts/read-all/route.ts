import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { markAllAlertsAsRead } from "@/modules/alerts/alerts.service";
import { z } from "zod";

const readAllSchema = z.object({
  userId: z.string().uuid().optional(),
});

export async function PATCH(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      ["alerts:update","alerts:update:own"],
      requestId,
    );

    if (!session) {
      return response;
    }

    let targetUserId = session.user.id;

    try {
      const body = await request.json();
      const validation = readAllSchema.safeParse(body);
      if (validation.success && validation.data.userId) {
        targetUserId = validation.data.userId;
      }
    } catch {
      // Body is optional; fallback to authenticated user ID
    }

    const result = await markAllAlertsAsRead(targetUserId, session.user);

    return apiSuccess(result, 200);
  } catch (error) {
    console.error(`[${requestId}] PATCH /api/alerts/read-all error:`, error);

    if (error instanceof Error && error.message === "FORBIDDEN_ALERT_ACCESS") {
      return apiError(
        "You do not have permission to mark alerts as read for this user.",
        403,
        undefined,
        requestId,
      );
    }

    return apiError("Failed to mark alerts as read.", 500, undefined, requestId);
  }
}
