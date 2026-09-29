import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getDepartmentById } from "@/modules/departments/department.service";
import { departmentIdSchema } from "@/modules/departments/department.validation";

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

    const validation = departmentIdSchema.safeParse({ id });
    if (!validation.success) {
      return apiError("Invalid department ID.",400,validation.error.flatten(),requestId);
    }

    const department = await getDepartmentById(validation.data.id);
    if (!department) {
      return apiError("Department not found.",404,undefined,requestId);
    }

    return apiSuccess(department, 200);
  } catch (error) {
    console.error(`[${requestId}] GET /api/departments/[id] error:`,error);
    return apiError("Failed to fetch department.",500,undefined,requestId);
  }
}