
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

    await requestPasswordReset(parsed.data.email);

    return apiSuccess(
      {
        message:
          "If an account exists for this email, password reset instructions will be sent.",
      },
      200,
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
