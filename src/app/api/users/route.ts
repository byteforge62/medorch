import { apiError, apiSuccess } from "@/lib/api/response";
import { getRequestId } from "@/lib/api/request-id";
import { authorizeApiPermission } from "@/lib/api/auth";
import {createUser ,getUsers } from "@/modules/users/user.service";
import { createUserSchema } from "@/modules/users/user.validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  try {
    const { session, response } = await authorizeApiPermission("users:read",requestId);
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

export async function POST(request: Request) {
    const requestId = getRequestId(request);

    try {
        const { session, response } = await authorizeApiPermission(
            "users:manage",
            requestId,
        );

        if (!session) {
            return response;
        }

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return apiError(
                "Invalid JSON request body.",
                400,
                undefined,
                requestId,
            );
        }

        const validation = createUserSchema.safeParse(body);

        if (!validation.success) {
            return apiError(
                "Invalid user data.",
                400,
                validation.error.flatten(),
                requestId,
            );
        }

        const user = await createUser(
            validation.data,
            session.user.id,
        );

        return apiSuccess(user, 200);
    } catch (error) {
        if (
            typeof error === "object" &&
            error !== null &&
            "code" in error &&
            error.code === "P2002"
        ) {
            return apiError(
                "A user with this email already exists.",
                409,
                undefined,
                requestId,
            );
        }

        console.error(`[${requestId}] POST /api/users error:`, error);

        return apiError(
            "Failed to create user.",
            500,
            undefined,
            requestId,
        );
    }
}