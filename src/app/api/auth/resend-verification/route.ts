
import { NextRequest } from "next/server";
import { ZodError, z } from "zod";

import { apiError, apiSuccess } from "@/lib/api/response";
import { resendPatientVerificationEmail } from "@/modules/users/user.service";

const resendVerificationSchema = z.object({
    email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
});

export async function POST(request: NextRequest) {
    const requestId = crypto.randomUUID();

    try {
        const body: unknown = await request.json();
        const { email } = resendVerificationSchema.parse(body);

        const forwardedFor = request.headers.get("x-forwarded-for");
        const realIp = request.headers.get("x-real-ip");

        const ipAddress =
            forwardedFor?.split(",")[0]?.trim() ||
            realIp?.trim() ||
            "unknown";

        const result = await resendPatientVerificationEmail(email, ipAddress);

        if (result.rateLimited) {
            return apiSuccess(
                {
                    message:
                        "You've reached the resend limit. Please wait 15 minutes before trying again.",
                    rateLimited: true,
                },
                429,
            );
        }

        return apiSuccess(
            {
                message:
                    "If an eligible account exists, a verification email will be sent.",
                rateLimited: false,
            },
            202,
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return apiError("Invalid email address.", 400);
        }

        console.error(`[${requestId}] Resend verification failed:`, error);
        return apiError("Unable to process the request. Please try again later.", 500);
    }
}
