import { apiError } from '@/lib/api/response';
import { getRequestId } from '@/lib/api/request-id';
import { getApiSession } from '@/lib/auth/authorization';
import { handleStaffSchedules } from '@/lib/api/me-read-handlers';
import { getSchedulesForStaff } from '@/modules/schedules/schedule.service';

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
