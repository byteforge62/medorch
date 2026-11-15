import { authorizeApiPermission } from "@/server/api/auth";
import { getRequestId } from "@/server/api/request-id";
import { apiError, apiSuccess } from "@/server/api/response";
import { getUserById } from "@/server/services/user.service";
import { userIdSchema } from "@/server/validation/user.validation";

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
      "users:read",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const validation = userIdSchema.safeParse({ id });

    if (!validation.success) {
      return apiError(
        "Invalid user ID.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const user = await getUserById(validation.data.id);

    if (!user) {
      return apiError(
        "User not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiSuccess(user, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/users/[id] error:`,
      error,
    );

    return apiError(
      "Failed to fetch user.",
      500,
      undefined,
      requestId,
    );
  }
}