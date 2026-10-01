import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  getDoctorById,
  updateDoctor,
} from "@/modules/doctors/doctor.service";
import {
  doctorIdSchema,
  updateDoctorSchema,
} from "@/modules/doctors/doctor.validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      ["ADMIN", "DOCTOR", "OT_STAFF"],
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const validation = doctorIdSchema.safeParse({ id });

    if (!validation.success) {
      return apiError(
        "Invalid doctor ID.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const doctor = await getDoctorById(validation.data.id);

    if (!doctor) {
      return apiError(
        "Doctor not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiSuccess(doctor, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/doctors/[id] error:`,
      error,
    );

    return apiError(
      "Failed to fetch doctor.",
      500,
      undefined,
      requestId,
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      "ADMIN",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const idValidation = doctorIdSchema.safeParse({ id });

    if (!idValidation.success) {
      return apiError(
        "Invalid doctor ID.",
        400,
        idValidation.error.flatten(),
        requestId,
      );
    }

    const body = await request.json();

    const validation = updateDoctorSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid doctor data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const doctor = await updateDoctor(
      idValidation.data.id,
      validation.data,
      session.user.id,
    );

    return apiSuccess(doctor, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/doctors/[id] error:`,
      error,
    );

    if (error instanceof Error) {
      if (error.message === "DOCTOR_NOT_FOUND") {
        return apiError(
          "Doctor not found.",
          404,
          undefined,
          requestId,
        );
      }
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return apiError(
        "The license number is already in use.",
        409,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to update doctor.",
      500,
      undefined,
      requestId,
    );
  }
}