import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { readJsonBody } from "@/lib/api/validation";
import { updateDoctorStatus } from "@/modules/doctors/doctor.service";
import {
  doctorIdSchema,
  updateDoctorStatusSchema,
} from "@/modules/doctors/doctor.validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      "doctors:manage",
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

    const bodyResult = await readJsonBody(request);

    if (!bodyResult.success) {
      return apiError("Invalid JSON request body.", 400, undefined, requestId);
    }

    const validation = updateDoctorStatusSchema.safeParse(bodyResult.data);

    if (!validation.success) {
      return apiError(
        "Invalid doctor status.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const result = await updateDoctorStatus(
      idValidation.data.id,
      validation.data.status,
      session.user.id,
    );

    return apiSuccess(result, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/doctors/[id]/status error:`,
      error,
    );

    if (
      error instanceof Error &&
      error.message === "DOCTOR_NOT_FOUND"
    ) {
      return apiError(
        "Doctor not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to update doctor status.",
      500,
      undefined,
      requestId,
    );
  }
}