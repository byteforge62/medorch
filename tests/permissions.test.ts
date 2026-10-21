
import assert from "node:assert/strict";
import test from "node:test";

import { UserRole } from "@/generated/prisma/enums";
import { hasPermission } from "@/lib/auth/permission";

test("ADMIN permissions", () => {
  assert.equal(hasPermission(UserRole.ADMIN, "schedules:read"), true);
  assert.equal(hasPermission(UserRole.ADMIN, "schedules:create"), true);
  assert.equal(
    hasPermission(UserRole.ADMIN, "schedules:notes:manage"),
    true,
  );
  assert.equal(
    hasPermission(UserRole.ADMIN, "schedules:equipment:manage"),
    true,
  );
  assert.equal(
    hasPermission(UserRole.ADMIN, "patients:clinical:read"),
    true,
  );
});

test("DOCTOR permissions", () => {
  assert.equal(hasPermission(UserRole.DOCTOR, "schedules:read"), true);
  assert.equal(hasPermission(UserRole.DOCTOR, "schedules:manage"), true);
  assert.equal(
    hasPermission(UserRole.DOCTOR, "schedules:notes:manage"),
    true,
  );
  assert.equal(
    hasPermission(UserRole.DOCTOR, "patients:clinical:read"),
    true,
  );
  assert.equal(
    hasPermission(UserRole.DOCTOR, "schedules:equipment:manage"),
    false,
  );
  assert.equal(
    hasPermission(UserRole.DOCTOR, "schedules:create"),
    false,
  );
  assert.equal(hasPermission(UserRole.DOCTOR, "otRooms:manage"), false);
  assert.equal(hasPermission(UserRole.DOCTOR, "equipment:manage"), false);
});

test("OT_STAFF cannot manage clinical notes or equipment assignments", () => {
  assert.equal(hasPermission(UserRole.OT_STAFF, "schedules:read"), true);
  assert.equal(
    hasPermission(UserRole.OT_STAFF, "schedules:notes:manage"),
    false,
  );
  assert.equal(
    hasPermission(UserRole.OT_STAFF, "schedules:equipment:manage"),
    false,
  );
  assert.equal(
    hasPermission(UserRole.OT_STAFF, "patients:clinical:read"),
    false,
  );
  assert.equal(hasPermission(UserRole.OT_STAFF, "otRooms:manage"), false);
  assert.equal(hasPermission(UserRole.OT_STAFF, "equipment:manage"), false);
});

test("PATIENT is restricted to own schedule access", () => {
  assert.equal(
    hasPermission(UserRole.PATIENT, "schedules:read:own"),
    true,
  );
  assert.equal(hasPermission(UserRole.PATIENT, "schedules:read"), false);
  assert.equal(
    hasPermission(UserRole.PATIENT, "schedules:notes:manage"),
    false,
  );
  assert.equal(
    hasPermission(UserRole.PATIENT, "patients:clinical:read"),
    false,
  );
});

test("schedule mutation permissions are role-restricted", () => {
  // Schedule creation
  assert.equal(
    hasPermission(UserRole.ADMIN, "schedules:create"),
    true
  );
  assert.equal(
    hasPermission(UserRole.DOCTOR, "schedules:create"),
    false
  );

  // Schedule notes
  assert.equal(
    hasPermission(UserRole.DOCTOR, "schedules:notes:manage"),
    true
  );
  assert.equal(
    hasPermission(UserRole.OT_STAFF, "schedules:notes:manage"),
    false
  );

  // Equipment assignment
  assert.equal(
    hasPermission(UserRole.ADMIN, "schedules:equipment:manage"),
    true
  );
  assert.equal(
    hasPermission(UserRole.DOCTOR, "schedules:equipment:manage"),
    false
  );

    // Schedule management
  assert.equal(
    hasPermission(UserRole.ADMIN, "schedules:manage"),
    true,
  );
  assert.equal(
    hasPermission(UserRole.DOCTOR, "schedules:manage"),
    true,
  );
  assert.equal(
    hasPermission(UserRole.OT_STAFF, "schedules:manage"),
    false,
  );
});
