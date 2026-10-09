import { authorizeApiPermission } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { updateEquipmentStatusById } from "@/modules/equipment/equipment.service";
import {
  equipmentIdSchema,
  updateEquipmentStatusSchema,
} from "@/modules/equipment/equipment.validation";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiPermission(
      "equipment:manage",
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const idValidation = equipmentIdSchema.safeParse({ id });

    if (!idValidation.success) {
      return apiError(
        "Invalid equipment ID.",
        400,
        idValidation.error.flatten(),
        requestId,
      );
    }

    const body = await request.json();

    const validation = updateEquipmentStatusSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid equipment status.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const equipment = await updateEquipmentStatusById(
      idValidation.data.id,
      validation.data.status,
      session.user.id
    );

    return apiSuccess(equipment, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/equipment/[id]/status error:`,
      error,
    );

    if (
      error instanceof Error &&
      error.message === "EQUIPMENT_NOT_FOUND"
    ) {
      return apiError(
        "Equipment not found.",
        404,
        undefined,
        requestId,
      );
    }

    if (error instanceof Error) {
      const messages: Record<string, string> = {
        EQUIPMENT_HAS_ACTIVE_ASSIGNMENTS:
          "Equipment with an active schedule assignment cannot be moved out of IN_USE.",
        EQUIPMENT_STATUS_REQUIRES_ASSIGNMENT:
          "Equipment can only be marked IN_USE through a schedule assignment.",
        EQUIPMENT_STATUS_CONFLICT:
          "Equipment status changed concurrently. Refresh and retry.",
      };

      const message = messages[error.message];

      if (message) {
        return apiError(message, 409, undefined, requestId);
      }
    }

    return apiError(
      "Failed to update equipment status.",
      500,
      undefined,
      requestId,
    );
  }
}