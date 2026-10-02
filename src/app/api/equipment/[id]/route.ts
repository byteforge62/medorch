import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { equipmentIdSchema, updateEquipmentSchema } from "@/modules/equipment/equipment.validation";
import { getEquipmentById,updateEquipmentById } from "@/modules/equipment/equipment.service";

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

    const validation = updateEquipmentSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid equipment data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const equipment = await updateEquipmentById(
      idValidation.data.id,
      validation.data,
    );

    return apiSuccess(equipment, 200);
  } catch (error) {
    console.error(
      `[${requestId}] PATCH /api/equipment/[id] error:`,
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

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return apiError(
        "Equipment with this serial number already exists.",
        409,
        undefined,
        requestId,
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "code" in error &&
      error.code === "P2003"
    ) {
      return apiError(
        "The specified department does not exist.",
        400,
        undefined,
        requestId,
      );
    }

    return apiError(
      "Failed to update equipment.",
      500,
      undefined,
      requestId,
    );
  }
}