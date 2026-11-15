import { authorizeApiPermission } from "@/server/api/auth";
import { getRequestId } from "@/server/api/request-id";
import { apiError, apiSuccess } from "@/server/api/response";
import { readJsonBody } from "@/server/api/validation";
import { getDoctors } from "@/server/services/doctor.service";
import { createDoctor } from "@/server/services/doctor.service";
import { createDoctorSchema } from "@/server/validation/doctor.validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);
  try {
    const { session, response } = await authorizeApiPermission("doctors:read", requestId);
    if (!session) {
      return response;
    }

    const doctors = await getDoctors();
    return apiSuccess(doctors, 200);
  } catch (error) {
    console.error(`[${requestId}] GET /api/doctors error`, error);
    return apiError("Failed to fetch doctors.", 500, undefined, requestId)
  }
}

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      "doctors:manage",
      requestId,
    );

    if (!session) {
      return response;
    }

    const bodyResult = await readJsonBody(request);

    if (!bodyResult.success) {
      return apiError("Invalid JSON request body.", 400, undefined, requestId);
    }

    const validation = createDoctorSchema.safeParse(bodyResult.data);

    if (!validation.success) {
      return apiError(
        "Invalid doctor data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const doctor = await createDoctor(validation.data, session.user.id);

    return apiSuccess(doctor, 200);
  }  catch (error: unknown) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return apiError("User not found.", 404, undefined, requestId);
      }

      if (error.message === "USER_NOT_DOCTOR") {
        return apiError(
          "The specified user does not have the DOCTOR role.",
          400,
          undefined,
          requestId,
        );
      }

      if (error.message === "DOCTOR_PROFILE_EXISTS") {
        return apiError(
          "Doctor profile already exists for this user.",
          409,
          undefined,
          requestId,
        );
      }
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return apiError(
        "A doctor profile with this unique value already exists.",
        409,
        undefined,
        requestId,
      );
    }

    console.error(`[${requestId}] POST /api/doctors error`, error);

    return apiError(
      "Failed to create doctor.",
      500,
      undefined,
      requestId,
    );
  }

}