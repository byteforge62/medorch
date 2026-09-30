import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createNewDepartment, getDepartments } from "@/modules/departments/department.service";
import { createDepartmentSchema } from "@/modules/departments/department.validation";

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

export async function POST(request: Request){
  const requestId = getRequestId(request);

  try{
   const {session,response} = await authorizeApiRole("ADMIN",requestId);
   if(!session){
    return response;
   }
   const body = await request.json();
   const validation = createDepartmentSchema.safeParse(body);
   if(!validation.success){
     return apiError("Invalid department data.",400,validation.error.flatten(),requestId);
   }

   const department = await createNewDepartment(validation.data);
   return apiSuccess(department,200);
  }catch(error){
   console.error(`[${requestId}] POST /api/departments error:`,error);
   return apiError("Failed to create department.",500,undefined,requestId);
  }
}