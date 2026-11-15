import { apiError } from '@/server/api/response';
import { getRequestId } from '@/server/api/request-id';
import { getApiSession } from '@/server/auth/authorization';
import { handlePatientAppointments } from '@/server/api/me-read-handlers';
import { getPatientPortalData } from '@/server/services/patient.service';

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
