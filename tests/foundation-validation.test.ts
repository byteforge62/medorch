import assert from "node:assert/strict";
import test from "node:test";

import { getAlertsQuerySchema } from "../src/modules/alerts/alerts.validation";
import { createUserSchema } from "../src/modules/users/user.validation";

test("alert read-state query accepts only true or false", () => {
  assert.equal(getAlertsQuerySchema.parse({ isRead: "true" }).isRead, true);
  assert.equal(getAlertsQuerySchema.parse({ isRead: "false" }).isRead, false);
  assert.equal(getAlertsQuerySchema.safeParse({ isRead: "yes" }).success, false);
});

test("user creation enforces the password-reset minimum length", () => {
  const user = {
    name: "Example User",
    email: "example@example.com",
    role: "DOCTOR",
  };

  assert.equal(
    createUserSchema.safeParse({ ...user, password: "shortpass" }).success,
    false,
  );
  assert.equal(
    createUserSchema.safeParse({ ...user, password: "twelve_chars" }).success,
    true,
  );
});
