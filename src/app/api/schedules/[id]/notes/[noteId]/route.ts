import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  deleteScheduleNoteById,
  updateScheduleNoteById,
} from "@/modules/schedules/schedule.service";
import {
  scheduleNoteIdSchema,
  updateScheduleNoteSchema,
} from "@/modules/schedules/schedule.validation";

type RouteContext = {
  params: Promise<{
    id: string;
    noteId: string;
  }>;
};

export async function PATCH(
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

    const { noteId } = await params;

    const idValidation = scheduleNoteIdSchema.safeParse({
      id: noteId,
    });

    if (!idValidation.success) {
      return apiError(
        "Invalid note ID.",
        400,
        idValidation.error.flatten(),
        requestId,
      );
    }

    const body = await request.json();

    const validation = updateScheduleNoteSchema.safeParse(
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

    const note = await updateScheduleNoteById(
      idValidation.data.id,
      session.user.id,
      validation.data.content,
    );

    return apiSuccess(note, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/schedules/[id]/notes/[noteId] error:`,
      error,
    );

    if (error instanceof Error) {
      if (error.message === "SCHEDULE_NOTE_NOT_FOUND") {
        return apiError(
          "Schedule note not found.",
          404,
          undefined,
          requestId,
        );
      }

      if (error.message === "SCHEDULE_NOTE_FORBIDDEN") {
        return apiError(
          "You are not allowed to modify this note.",
          403,
          undefined,
          requestId,
        );
      }
    }

    return apiError(
      "Failed to update schedule note.",
      500,
      undefined,
      requestId,
    );
  }
}

export async function DELETE(
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

    const { noteId } = await params;

    const idValidation = scheduleNoteIdSchema.safeParse({
      id: noteId,
    });

    if (!idValidation.success) {
      return apiError(
        "Invalid note ID.",
        400,
        idValidation.error.flatten(),
        requestId,
      );
    }

    const note = await deleteScheduleNoteById(
      idValidation.data.id,
      session.user.id,
    );

    return apiSuccess(note, 200);
  } catch (error) {
    console.error(
      `[${requestId}] DELETE /api/schedules/[id]/notes/[noteId] error:`,
      error,
    );

    if (error instanceof Error) {
      if (error.message === "SCHEDULE_NOTE_NOT_FOUND") {
        return apiError(
          "Schedule note not found.",
          404,
          undefined,
          requestId,
        );
      }

      if (error.message === "SCHEDULE_NOTE_FORBIDDEN") {
        return apiError(
          "You are not allowed to delete this note.",
          403,
          undefined,
          requestId,
        );
      }
    }

    return apiError(
      "Failed to delete schedule note.",
      500,
      undefined,
      requestId,
    );
  }
}