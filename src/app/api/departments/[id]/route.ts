import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { deactivateDepartment, getDepartmentById, updateExistingDepartment} from "@/modules/departments/department.service";
import { departmentIdSchema, updateDepartmentSchema } from "@/modules/departments/department.validation";

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

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  const requestId = getRequestId(request);

  try {
    const { session, response } = await authorizeApiRole("ADMIN",requestId);
    if (!session) {
      return response;
    }

    const { id } = await params;

    const idValidation = departmentIdSchema.safeParse({ id });
    if (!idValidation.success) {
      return apiError("Invalid department ID.",400,idValidation.error.flatten(),requestId);
    }

    const body = await request.json();

    const validation = updateDepartmentSchema.safeParse(body);
    if (!validation.success) {
      return apiError("Invalid department data.",400,validation.error.flatten(),requestId);
    }

    const existingDepartment = await getDepartmentById(idValidation.data.id);
    if (!existingDepartment) {
      return apiError("Department not found.",404,undefined,requestId);
    }

    const department = await updateExistingDepartment(idValidation.data.id,validation.data,session.user.id);

    return apiSuccess(department, 200);
  } catch (error) {
    console.error(`[${requestId}] PATCH /api/departments/[id] error:`,error);
    if (error && typeof error === "object" && "code" in error && error.code === "P2002") {
      return apiError("A department with this name already exists.",409,undefined,requestId);
    }

    return apiError("Failed to update department.",500,undefined,requestId);
  }
}

export async function DELETE(
  request: Request,
  {params}: RouteContext,
){
  const requestId = getRequestId(request);
  try{
   const {session,response} = await authorizeApiRole("ADMIN",requestId);
   if(!session){
    return response;
   }

   const {id} = await params;

   const validation = departmentIdSchema.safeParse({id});
   if(!validation.success){
    return apiError("Invalid department ID",400,validation.error.flatten(),requestId)
   }

   const existingDepartment = await getDepartmentById(validation.data.id,session.user.id);
   if(!existingDepartment){
    return apiError("Department not found",404,undefined,requestId)
   }

   if(!existingDepartment.isActive){
    return apiError("Department is already inactive",409,undefined,requestId)
   }

   const department = await deactivateDepartment(validation.data.id);
   return apiSuccess(department,200)
  }catch(error){
  console.error(`[${requestId}] DELETE /api/departments/[id] error:`,error);
    return apiError("Failed to deactivate department.",500,undefined,requestId);
  }
}