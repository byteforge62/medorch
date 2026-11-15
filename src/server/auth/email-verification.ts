import { createHash, randomBytes } from "crypto";

const TOKEN_BYTES = 32;
const TOKEN_EXPIRY_MINUTES = 30;


export function generateEmailVerificationToken(): string{
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export function hashEmailVerificationToken(token: string): string{
    return createHash("sha256").update(token).digest("hex");
}

export function getEmailVerificationExpiry(): Date{
    return new Date(Date.now() + TOKEN_EXPIRY_MINUTES * 60 * 1000);
}
