import type {UserRole, UserStatus} from "@/generated/prisma/client"

export function hasRole(userRole: UserRole, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(userRole);
}

export  function isActiveUser(status: UserStatus): boolean {
  return status === "ACTIVE";
}

export function canAccessRole(userRole: UserRole,userStatus: UserStatus, allowedRoles: UserRole[]):boolean {
    return isActiveUser(userStatus) && hasRole(userRole, allowedRoles);
}
