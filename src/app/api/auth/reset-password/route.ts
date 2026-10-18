
import { NextRequest } from "next/server";
import { z } from "zod";

import { createHash } from "node:crypto";
import { recordVerificationEmailRequest } from "@/modules/users/user.repository";
import { apiError, apiSuccess } from "@/lib/api/response";
import { readJsonBody } from "@/lib/api/validation";
import { completePasswordReset } from "@/modules/users/user.service";

const resetPasswordSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i),
  password: z.string().min(12).max(128),
});

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const bodyResult = await readJsonBody(request);
    if (!bodyResult.success) {
      return apiError("Invalid JSON request body.", 400, undefined, requestId);
    }

    const parsed = resetPasswordSchema.safeParse(bodyResult.data);

    if (!parsed.success) {
      return apiError(
        "Invalid reset link or password. Use a password between 12 and 128 characters.",
        400,
        undefined,
        requestId,
      );
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
const ipAddress =
  forwardedFor?.split(",")[0]?.trim() ||
  request.headers.get("x-real-ip") ||
  "unknown";

const ipHash = createHash("sha256")
  .update(ipAddress)
  .digest("hex");

const tokenHash = createHash("sha256")
  .update(parsed.data.token)
  .digest("hex");

const allowed = await recordVerificationEmailRequest(
  tokenHash,
  ipHash,
  "PASSWORD_RESET_ATTEMPT",
);

if (!allowed) {
  return apiError(
    "Too many password reset attempts. Please wait 15 minutes before trying again.",
    429,
    undefined,
    requestId,
  );
}

    const result = await completePasswordReset(
      parsed.data.token,
      parsed.data.password,
    );

    if (!result.reset) {
      return apiError(
        "This password reset link is invalid, expired, or already used.",
        400,
        undefined,
        requestId,
      );
    }

    return apiSuccess(
      { message: "Your password has been reset successfully." },
      200,
    );
  } catch (error) {
    console.error(`[${requestId}] Password reset failed:`, error);

    return apiError(
      "Unable to reset your password. Please try again later.",
      500,
      undefined,
      requestId,
    );
  }
}
