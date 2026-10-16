
import { NextRequest } from "next/server";
import { z } from "zod";

import { apiError, apiSuccess } from "@/lib/api/response";
import { requestPasswordReset } from "@/modules/users/user.service";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
});

export async function POST(request: NextRequest) {
  const requestId = crypto.randomUUID();

  try {
    const body: unknown = await request.json();
    const parsed = forgotPasswordSchema.safeParse(body);

    if (!parsed.success) {
      return apiError("Please enter a valid email address.", 400, undefined, requestId);
    }

    const forwardedFor = request.headers.get("x-forwarded-for");
    const ipAddress =
      forwardedFor?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const result = await requestPasswordReset(
      parsed.data.email,
      ipAddress,
    );

    if (result.rateLimited) {
      return apiSuccess(
        {
          message:
            "You've reached the password reset request limit. Please wait 15 minutes before trying again.",
          rateLimited: true,
        },
        429,
      );
    }

    return apiSuccess(
      {
        message:
          "If an eligible account exists, a password reset email will be sent.",
      },
      202,
    );
  } catch (error) {
    console.error(`[${requestId}] Forgot-password request failed:`, error);

    return apiError(
      "Unable to process your request. Please try again later.",
      500,
      undefined,
      requestId,
    );
  }
}
