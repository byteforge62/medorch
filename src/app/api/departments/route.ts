import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getDepartments } from "@/modules/departments/department.service";

export async function GET(request: Request) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole(["ADMIN", "DOCTOR", "OT_STAFF"],requestId,);
    if (!session) {
      return response;
    }

    const departments = await getDepartments();
    return apiSuccess(departments, 200);
  } catch (error) {
    console.error(`[${requestId}] GET /api/departments error:`,error,);
    return apiError("Failed to fetch departments.",500,undefined,requestId)}
}