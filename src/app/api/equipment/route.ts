import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getEquipment, createEquipment } from "@/modules/equipment/equipment.service";
import { createEquipmentSchema } from "@/modules/equipment/equipment.validation";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      ["ADMIN", "DOCTOR", "OT_STAFF"],
      requestId,
    );

    if (!session) {
      return response;
    }

    const equipment = await getEquipment();

    return apiSuccess(equipment, 200);
  } catch (error) {
    console.error(
      `[${requestId}] GET /api/equipment error:`,
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

export async function POST(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(
      "ADMIN",
      requestId,
    );

    if (!session) {
      return response;
    }

    const body = await request.json();

    const validation = createEquipmentSchema.safeParse(body);

    if (!validation.success) {
      return apiError(
        "Invalid equipment data.",
        400,
        validation.error.flatten(),
        requestId,
      );
    }

    const equipment = await createEquipment(validation.data);

    return apiSuccess(equipment, 200);
  } catch (error) {
    console.error(
      `[${requestId}] POST /api/equipment error:`,
      error,
    );

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
      "Failed to create equipment.",
      500,
      undefined,
      requestId,
    );
  }
}