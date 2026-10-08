import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getDoctors } from "@/modules/doctors/doctor.service";
import { createDoctor } from "@/modules/doctors/doctor.service";
import { createDoctorSchema } from "@/modules/doctors/doctor.validation";

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

    const body = await request.json();

    const validation = createDoctorSchema.safeParse(body);

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
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === "USER_NOT_FOUND") {
        return apiError(
          "User not found.",
          404,
          undefined,
          requestId,
        );
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

      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error as { code?: unknown }).code === "P2002"
      ) {
        return apiError(
          "A doctor profile with this unique value already exists.",
          409,
          undefined,
          requestId
        );
      }

      return apiError(
        "Failed to create doctor.",
        500,
        undefined,
        requestId
      );
    }
  }
}