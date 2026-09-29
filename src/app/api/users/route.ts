import { apiError, apiSuccess } from "@/lib/api/response";
import { getRequestId } from "@/lib/api/request-id";
import { requireApiRole } from "@/lib/auth/authorization";
import { getUsers } from "@/modules/users/user.service";

export async function GET(request: Request){
  const requestId = getRequestId(request);
  try{
   const session = await requireApiRole("ADMIN");
   if(!session){
    return apiError("Unauthorized",401,undefined,requestId);
   }

   const users = await getUsers();
   return apiSuccess(users,200);
  }catch(error){
   console.error(`[${requestId}] GET /api/users error:`,error);
   return apiError("Failed to fetch users.",500,undefined,requestId)
  }
}