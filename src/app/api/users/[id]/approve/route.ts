
import { apiError, apiSuccess } from "@/lib/api/response";
import { getRequestId } from "@/lib/api/request-id";
import { authorizeApiPermission } from "@/lib/api/auth";
import { approvePatient } from "@/modules/users/user.service";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      "users:manage",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await context.params;

    if (!id || id.length > 100) {
      return apiError(
        "Invalid user ID.",
        400,
        undefined,
        requestId,
      );
    }

    const patient = await approvePatient(id, session.user.id);

    return apiSuccess(patient, 200);
  } catch (error) {
    if (error instanceof Error) {
      switch (error.message) {
        case "USER_NOT_FOUND":
          return apiError("User not found.", 404, undefined, requestId);
        case "USER_NOT_PATIENT":
          return apiError("Only patient accounts can be approved.", 409, undefined, requestId);
        case "USER_NOT_PENDING":
          return apiError("This account is not pending approval.", 409, undefined, requestId);
        case "EMAIL_NOT_VERIFIED":
          return apiError("The patient must verify their email before approval.", 409, undefined, requestId);
      }
    }

    console.error(`[${requestId}] POST /api/users/${"approve"} error:`, error);

    return apiError(
      "Failed to approve patient.",
      500,
      undefined,
      requestId,
    );
  }
}
