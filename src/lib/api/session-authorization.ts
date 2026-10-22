import { UserRole } from '@/generated/prisma/enums';
import { hasPermission, type Permission } from '@/lib/auth/permission';
import { apiError } from '@/lib/api/response';

export type ApiSession = {
  user: {
    id: string;
    role: UserRole;
  };
} | null;

export function authorizeApiSession(
  session: ApiSession,
  permissions: Permission | Permission[],
  requestId: string,
  allowedRoles?: readonly UserRole[],
  roleForbiddenMessage = 'Forbidden',
) {
  if (!session) {
    return {
      session: null,
      response: apiError('Unauthorized', 401, undefined, requestId),
    };
  }

  if (allowedRoles && !allowedRoles.includes(session.user.role)) {
    return {
      session: null,
      response: apiError(roleForbiddenMessage, 403, undefined, requestId),
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
      response: apiError('Forbidden', 403, undefined, requestId),
    };
  }

  return {
    session,
    response: null,
  };
}
