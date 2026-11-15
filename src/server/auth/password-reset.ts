
import { createHash, randomBytes } from "node:crypto";

const PASSWORD_RESET_EXPIRY_MINUTES = 15;

export function generatePasswordResetToken(): string {
  return randomBytes(32).toString("hex");
}

export function hashPasswordResetToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function getPasswordResetExpiry(): Date {
  return new Date(
    Date.now() + PASSWORD_RESET_EXPIRY_MINUTES * 60 * 1000,
  );
}
