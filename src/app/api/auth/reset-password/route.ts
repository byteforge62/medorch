
import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api/response";
import { completePasswordReset } from "@/modules/users/user.service";

const resetPasswordSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/i),
  password: z.string().min(12).max(128),
});

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body: unknown = await request.json();
    const parsed = resetPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return apiError(
        "Invalid reset link or password. Use a password between 12 and 128 characters.",
        400,
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
