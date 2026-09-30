import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { updateDoctorStatus } from "@/modules/doctors/doctor.service";
import { updateDoctorStatusSchema } from "@/modules/doctors/doctor.validation";

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
    const { session, response } = await authorizeApiRole(
      "ADMIN",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const body = await request.json();

    const validation = updateDoctorStatusSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid doctor status.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const result = await updateDoctorStatus(
      id,
      validation.data.status,
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