import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  getDoctorById,
} from "@/modules/doctors/doctor.service";
import {
  doctorIdSchema,
} from "@/modules/doctors/doctor.validation";

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
    const { session, response } = await authorizeApiRole(["ADMIN", "DOCTOR", "OT_STAFF"],requestId);
    if (!session) {
      return response;
    }

    const { id } = await params;

    const validation = doctorIdSchema.safeParse({ id });

    if (!validation.success) {
      return apiError("Invalid doctor ID.",400,validation.error.flatten(),requestId);
    }

    const doctor = await getDoctorById(validation.data.id);
    if (!doctor) {
      return apiError("Doctor not found.",404,undefined,requestId);
    }

    return apiSuccess(doctor, 200);
  } catch (error) {
    console.error(`[${requestId}] GET /api/doctors/[id] error:`,error);
    return apiError("Failed to fetch doctor.",500,undefined,requestId);
  }
}