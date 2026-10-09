import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  createScheduleNoteById,
  getScheduleNotes,
} from "@/modules/schedules/schedule.service";
import {
  createScheduleNoteSchema,
  scheduleIdSchema,
} from "@/modules/schedules/schedule.validation";

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
      "schedules:read",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const validation = scheduleIdSchema.safeParse({ id });

    if (!validation.success) {
      return apiError(
        "Invalid schedule ID.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const notes = await getScheduleNotes(
      validation.data.id,
    );

    return apiSuccess(notes, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/schedules/[id]/notes error:`,
      error,
    );

    if (
      error instanceof Error &&
      error.message === "SCHEDULE_NOT_FOUND"
    ) {
      return apiError(
        "Schedule not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to fetch schedule notes.",
      500,
      undefined,
      requestId,
    );
  }
}

export async function POST(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      "schedules:notes:manage",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const idValidation = scheduleIdSchema.safeParse({ id });

    if (!idValidation.success) {
      return apiError(
        "Invalid schedule ID.",
        400,
        idValidation.error.flatten(),
        requestId,
      );
    }

    const body = await request.json();

    const validation = createScheduleNoteSchema.safeParse(
      body,
    );

    if (!validation.success) {
      return apiError(
        "Invalid schedule note.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const note = await createScheduleNoteById(
      idValidation.data.id,
      session.user.id,
      validation.data.content,
    );

    return apiSuccess(note, 200);
  } catch (error) {
    console.error(
      `[${requestId}] POST /api/schedules/[id]/notes error:`,
      error,
    );

    if (
      error instanceof Error &&
      error.message === "SCHEDULE_NOT_FOUND"
    ) {
      return apiError(
        "Schedule not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to create schedule note.",
      500,
      undefined,
      requestId,
    );
  }
}