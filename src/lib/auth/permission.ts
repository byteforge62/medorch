import { UserRole } from "@/generated/prisma/enums";

export const ROLE_PERMISSIONS = {
    ADMIN: [
    "users:read",
    "users:manage",
    "departments:read",
    "departments:manage",
    "otRooms:read",
    "otRooms:manage",
    "equipment:read",
    "equipment:manage",
    "schedules:read",
    "schedules:manage",
    "patients:read",
    "patients:manage",
    "alerts:read",
    "alerts:manage",
  ],

  DOCTOR: [
    "departments:read",
    "otRooms:read",
    "equipment:read",
    "schedules:read",
    "schedules:manage",
    "patients:read",
    "alerts:read",
  ],

  OT_STAFF: [
    "departments:read",
    "otRooms:read",
    "equipment:read",
    "schedules:read",
    "schedules:manage",
    "alerts:read",
  ],

  PATIENT: [
    "schedules:read:own",
    "alerts:read",
  ],
} as const satisfies Record<UserRole, readonly string[]>;

export type Permission = (typeof ROLE_PERMISSIONS)[UserRole][number];

export function hasPermission(
  role: UserRole,
  permission: Permission,
): boolean {
  const permissions: readonly string[] = ROLE_PERMISSIONS[role];

  return permissions.includes(permission);
}