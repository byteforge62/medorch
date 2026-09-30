import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getPatientById } from "@/modules/patients/patient.service";
import { patientIdSchema } from "@/modules/patients/patient.validation";

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

    const validation = patientIdSchema.safeParse({ id });

    if (!validation.success) {
      return apiError(
        "Invalid patient ID.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const patient = await getPatientById(validation.data.id);

    if (!patient) {
      return apiError(
        "Patient not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiSuccess(patient, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/patients/[id] error:`,
      error,
    );

    return apiError(
      "Failed to fetch patient.",
      500,
      undefined,
      requestId,
    );
  }
}