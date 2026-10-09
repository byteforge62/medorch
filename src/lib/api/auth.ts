import { getApiSession } from "../auth/authorization";
import { hasPermission, type Permission } from "../auth/permission";
import { apiError } from "./response";

export async function authorizeApiPermission(
  permissions: Permission | Permission[],
  requestId: string,
) {
  const session = await getApiSession();

  if (!session) {
    return {
      session: null,
      response: apiError("Unauthorized", 401, undefined, requestId),
    };
  }

  const requiredPermissions = Array.isArray(permissions)
    ? permissions
    : [permissions];

  const hasRequiredPermission = requiredPermissions.some((permission) =>
    hasPermission(session.user.role, permission),
  );

  if (!hasRequiredPermission) {
    return {
      session: null,
      response: apiError("Forbidden", 403, undefined, requestId),
    };
  }

  return {
    session,
    response: null,
  };
}