import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getPatientPortalData } from "@/modules/patients/patient.service";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      "schedules:read:own",
      requestId,
    );

    if (!session) {
      return response;
    }

    const patient = await getPatientPortalData(session.user.id);

    if (!patient) {
      return apiError(
        "No patient record is linked to this account.",
        404,
        undefined,
        requestId,
      );
    }

    return apiSuccess(patient, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/me/appointments error:`,
      error,
    );

    return apiError(
      "Failed to fetch patient appointments.",
      500,
      undefined,
      requestId,
    );
  }
}