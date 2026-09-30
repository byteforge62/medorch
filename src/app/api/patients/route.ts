import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getPatients } from "@/modules/patients/patient.service";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      ["ADMIN", "DOCTOR", "OT_STAFF"],
      requestId,
    );

    if (!session) {
      return response;
    }

    const patients = await getPatients();

    return apiSuccess(patients, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/patients error:`,
      error,
    );

    return apiError(
      "Failed to fetch patients.",
      500,
      undefined,
      requestId,
    );
  }
}