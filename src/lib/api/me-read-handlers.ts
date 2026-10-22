import type { UserRole } from '@/generated/prisma/enums';
import {
  authorizeApiSession,
  type ApiSession,
} from '@/lib/api/session-authorization';
import { apiError, apiSuccess } from '@/lib/api/response';

type Session = ApiSession;

type Dependencies<T> = {
  session: Session;
  requestId: string;
  getData: (userId: string) => Promise<T>;
};

export async function handleStaffSchedules<T>({
  session,
  requestId,
  getData,
}: Dependencies<T>) {
  try {
    const authorization = authorizeApiSession(
      session,
      'schedules:read',
      requestId,
      ['OT_STAFF' as UserRole],
      'Only OT staff accounts can access staff assignments.',
    );

    if (!authorization.session) {
      return authorization.response;
    }

    const data = await getData(authorization.session.user.id);
    return apiSuccess(data, 200);
  } catch (error) {
    console.error(`[${requestId}] GET /api/me/staff-schedules error:`, error);

    return apiError(
      'Failed to fetch your staff assignments.',
      500,
      undefined,
      requestId,
    );
  }
}

export async function handlePatientAppointments<T>({
  session,
  requestId,
  getData,
}: Dependencies<T>) {
  try {
    const authorization = authorizeApiSession(
      session,
      'schedules:read:own',
      requestId,
    );

    if (!authorization.session) {
      return authorization.response;
    }

    const patient = await getData(authorization.session.user.id);

    if (!patient) {
      return apiError(
        'No patient record is linked to this account.',
        404,
        undefined,
        requestId,
      );
    }

    return apiSuccess(
      {
        ...(patient as object),
        currentTime: Date.now(),
      },
      200,
    );
  } catch (error) {
    console.error(`[${requestId}] GET /api/me/appointments error:`, error);

    return apiError(
      'Failed to fetch patient appointments.',
      500,
      undefined,
      requestId,
    );
  }
}
