import { UserRole } from "@/generated/prisma/enums";

export const ROLE_PERMISSIONS = {
    ADMIN: [
    "users:read",
    "users:manage",
    "departments:read",
    "departments:manage",
    "doctors:read",
    "doctors:manage",
    "otRooms:read",
    "otRooms:manage",
    "equipment:read",
    "equipment:manage",
    "schedules:read",
    "schedules:create",
    "schedules:manage",
    "schedules:staff:manage",
    "schedules:equipment:manage",
    "schedules:notes:manage",
    "patients:read",
    "patients:manage",
    "audit:read",
    "alerts:read",
    "alerts:manage",
    "alerts:create",
    "alerts:update",
    "alerts:delete",
  ],

  DOCTOR: [
    "departments:read",
    "otRooms:read",
    "equipment:read",
    "schedules:read",
    "schedules:manage",
    "schedules:notes:manage",
    "doctors:read",
    "patients:read",
    "alerts:read",
    "alerts:create",
    "alerts:update:own",
    "alerts:delete:own",

  ],

  OT_STAFF: [
    "departments:read",
    "otRooms:read",
    "equipment:read",
    "schedules:read",
    "schedules:manage",
    "doctors:read",
    "alerts:read",
    "alerts:create",
    "alerts:update:own",
    "alerts:delete:own",
  ],

  PATIENT: [
    "schedules:read:own",
    "alerts:read",
    "alerts:update:own",
    "alerts:delete:own",
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