
import { UserRole } from "@/generated/prisma/enums";
import { getApiSession } from "../auth/authorization";
import { hasPermission, type Permission } from "../auth/permission";
import { apiError } from "./response";

type ApiSession = Awaited<ReturnType<typeof getApiSession>>;

export function authorizeApiSession(
  session: ApiSession,
  permissions: Permission | Permission[],
  requestId: string,
  allowedRoles?: readonly UserRole[],
  roleForbiddenMessage = "Forbidden",
) {
  if (!session) {
    return {
      session: null,
      response: apiError("Unauthorized", 401, undefined, requestId),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return {
      session: null,
      response: apiError(
        roleForbiddenMessage,
        403,
        undefined,
        requestId,
      ),
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

export async function authorizeApiPermission(
  permissions: Permission | Permission[],
  requestId: string,
  allowedRoles?: readonly UserRole[],
  roleForbiddenMessage?: string,
) {
  const session = await getApiSession();

  return authorizeApiSession(
    session,
    permissions,
    requestId,
    allowedRoles,
    roleForbiddenMessage,
  );
}
