import type { UserRole } from "@/generated/prisma/client";

import { getApiSession, requireApiRole } from "../auth/authorization";
import { hasPermission, type Permission } from "../auth/permission";
import { apiError } from "./response";

export async function authorizeApiRole(roles: UserRole | UserRole[],requestId: string){
    const session = await requireApiRole(roles);
    if(!session){
        return{
            session: null,
            response: apiError("Unauthorized",401,undefined,requestId)
        }
    }

    return {
        session,
        response: null
    }
}

export async function authorizeApiPermission(
  permission: Permission | Permission[],
  requestId: string,
) {
  const session = await getApiSession();

  if (!session) {
    return {
      session: null,
      response: apiError("Unauthorized", 401, undefined, requestId),
    };
  }

  const requiredPermissions = Array.isArray(permission) ? permission : [permission];
  const hasRequiredPermission = requiredPermissions.some((permission) => hasPermission(session.user.role, permission))

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
