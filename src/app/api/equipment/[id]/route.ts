import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getEquipmentById } from "@/modules/equipment/equipment.service";
import { equipmentIdSchema } from "@/modules/equipment/equipment.validation";

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
    const { session, response } = await authorizeApiRole(
      ["ADMIN", "DOCTOR", "OT_STAFF"],
      requestId,
    );

    if (!session) {
      return response;
    }

    const { id } = await params;

    const validation = equipmentIdSchema.safeParse({ id });

    if (!validation.success) {
      return apiError(
        "Invalid equipment ID.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const equipment = await getEquipmentById(validation.data.id);

    if (!equipment) {
      return apiError(
        "Equipment not found.",
        404,
        undefined,
        requestId,
      );
    }

    return apiSuccess(equipment, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/equipment/[id] error:`,
      error,
    );

    return apiError(
      "Failed to fetch equipment.",
      500,
      undefined,
      requestId,
    );
  }
}