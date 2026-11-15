import { apiError } from '@/server/api/response';
import { getRequestId } from '@/server/api/request-id';
import { getApiSession } from '@/server/auth/authorization';
import { handleStaffSchedules } from '@/server/api/me-read-handlers';
import { getSchedulesForStaff } from '@/server/services/schedule.service';

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const session = await getApiSession();

    return handleStaffSchedules({
      session,
      requestId,
      getData: getSchedulesForStaff,
    });
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/me/staff-schedules session error:`,
      error,
    );

    return apiError(
      'Failed to fetch your staff assignments.',
      500,
      undefined,
      requestId,
    );
  }
}
