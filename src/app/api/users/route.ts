import { getApiErrorMessage } from "@/lib/api/error";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requireApiRole } from "@/lib/auth/authorization";
import { getUsers } from "@/modules/users/user.service";

export async function GET(){
  try{
   const session = await requireApiRole("ADMIN");
   if(!session){
    return apiError("Unauthorized",401);
   }

   const users = await getUsers();
   return apiSuccess(users,200);
  }catch(error){
   console.error("GET /api/users error:",error);
   return apiError(getApiErrorMessage(error),500)
  }
}