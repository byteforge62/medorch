import { getApiSession } from '@/lib/auth/authorization';
import type { Permission } from '@/lib/auth/permission';
import {
  authorizeApiSession,
  type ApiSession,
} from '@/lib/api/session-authorization';

export { authorizeApiSession };
export type { ApiSession };

export async function authorizeApiPermission(
  permissions: Permission | Permission[],
  requestId: string,
  allowedRoles?: readonly import('@/generated/prisma/enums').UserRole[],
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
