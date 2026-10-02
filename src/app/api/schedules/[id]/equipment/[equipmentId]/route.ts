import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { releaseScheduleEquipmentById } from "@/modules/schedules/schedule.service";
import { scheduleIdSchema } from "@/modules/schedules/schedule.validation";

type RouteContext = {
  params: Promise<{
    id: string;
    equipmentId: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      "ADMIN",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id, equipmentId } = await params;

    const scheduleValidation =
      scheduleIdSchema.safeParse({ id });

    if (!scheduleValidation.success) {
      return apiError(
        "Invalid schedule ID.",
        400,
        scheduleValidation.error.flatten(),
        requestId,
      );
    }

    const equipmentValidation =
      scheduleIdSchema.safeParse({
        id: equipmentId,
      });

    if (!equipmentValidation.success) {
      return apiError(
        "Invalid equipment assignment ID.",
        400,
        equipmentValidation.error.flatten(),
        requestId,
      );
    }

    const assignment =
      await releaseScheduleEquipmentById(
        equipmentValidation.data.id,
        session.user.id
      );

    return apiSuccess(assignment, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/schedules/[id]/equipment/[equipmentId] error:`,
      error,
    );

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2025"
    ) {
      return apiError(
        "Equipment assignment not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to release schedule equipment.",
      500,
      undefined,
      requestId,
    );
  }
}