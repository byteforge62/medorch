import { requireApiRole } from "@/lib/auth/authorization";
import { getApiErrorMessage } from "@/lib/api/error";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getUserById } from "@/modules/users/user.service";
import { userIdSchema } from "@/modules/users/user.validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: RouteContext,
) {
  try {
    const session = await requireApiRole("ADMIN");

    if (!session) {
      return apiError("Unauthorized.", 401);
    }

    const { id } = await params;

    const validation = userIdSchema.safeParse({ id });

    if (!validation.success) {
      return apiError("Invalid user ID.", 400);
    }

    const user = await getUserById(validation.data.id);

    if (!user) {
      return apiError("User not found.", 404);
    }

    return apiSuccess(user, 200);
  } catch (error) {
    console.error("GET /api/users/[id] error:", error);

    return apiError(
      getApiErrorMessage(error),
      500,
    );
  }
}