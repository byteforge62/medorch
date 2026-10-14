
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

        await resendPatientVerificationEmail(email);

        // Keep the response identical whether the account exists or not.
        return apiSuccess(
            "If an eligible account exists, a verification email will be sent.",
            200
        );
    } catch (error) {
        if (error instanceof ZodError) {
            return apiError("Invalid email address.", 400);
        }

        console.error(`[${requestId}] Resend verification failed:`, error);
        return apiError("Unable to process the request. Please try again later.", 500);
    }
}
