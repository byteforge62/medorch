import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getPatients } from "@/modules/patients/patient.service";
import { createPatient } from "@/modules/patients/patient.service";
import { createPatientSchema } from "@/modules/patients/patient.validation";

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

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      "ADMIN",
      requestId,
    );

    if (!session) {
      return response;
    }

    const body = await request.json();

    const validation = createPatientSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid patient data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const patient = await createPatient(validation.data);

    return apiSuccess(patient, 200);
  } catch (error) {
    console.error(
      `[${requestId}] POST /api/patients error:`,
      error,
    );

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return apiError(
        "Patient code or user association already exists.",
        409,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to create patient.",
      500,
      undefined,
      requestId,
    );
  }
}