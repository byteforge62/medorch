import { apiError, apiSuccess } from "@/lib/api/response";
import { getRequestId } from "@/lib/api/request-id";
import { authorizeApiRole } from "@/lib/api/auth";
import { getUsers } from "@/modules/users/user.service";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  try {
    const { session, response } = await authorizeApiRole("ADMIN",requestId);
    if (!session) {
      return response;
    }

    const users = await getUsers();
    return apiSuccess(users, 200);
  } catch (error) {
    console.error(`[${requestId}] GET /api/users error:`, error);
    return apiError("Failed to fetch users.", 500, undefined, requestId)
  }
}