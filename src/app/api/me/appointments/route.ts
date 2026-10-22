import { apiError } from '@/lib/api/response';
import { getRequestId } from '@/lib/api/request-id';
import { getApiSession } from '@/lib/auth/authorization';
import { handlePatientAppointments } from '@/lib/api/me-read-handlers';
import { getPatientPortalData } from '@/modules/patients/patient.service';

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const session = await getApiSession();

    return handlePatientAppointments({
      session,
      requestId,
      getData: getPatientPortalData,
    });
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/me/appointments session error:`,
      error,
    );

    return apiError(
      'Failed to fetch patient appointments.',
      500,
      undefined,
      requestId,
    );
  }
}
