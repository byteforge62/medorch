import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getPatientById, updatePatientById } from "@/modules/patients/patient.service";
import { patientIdSchema, updatePatientSchema } from "@/modules/patients/patient.validation";


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
    const { session, response } = await authorizeApiPermission(
      "patients:read",
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

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      "patients:manage",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const idValidation = patientIdSchema.safeParse({ id });

    if (!idValidation.success) {
      return apiError(
        "Invalid patient ID.",
        400,
        idValidation.error.flatten(),
        requestId,
      );
    }

    const body = await request.json();

    const validation = updatePatientSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid patient data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const patient = await updatePatientById(
      idValidation.data.id,
      validation.data,
      session.user.id
    );

    return apiSuccess(patient, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/patients/[id] error:`,
      error,
    );

    if (
      error instanceof Error &&
      error.message === "PATIENT_NOT_FOUND"
    ) {
      return apiError(
        "Patient not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to update patient.",
      500,
      undefined,
      requestId,
    );
  }
}