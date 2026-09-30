import { authorizeApiRole } from "@/lib/api/auth";
import { getRequestId } from "@/lib/api/request-id";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getDoctors } from "@/modules/doctors/doctor.service";

export async function GET(request: Request){
    const requestId = getRequestId(request);
    try{
     const {session,response} = await authorizeApiRole(["ADMIN","DOCTOR","OT_STAFF"],requestId);
     if(!session){
        return response;
     }

     const doctors = await getDoctors();
     return apiSuccess(doctors,200);
    }catch(error){
      console.error(`[${requestId}] GET /api/doctors error`,error);
      return apiError("Failed to fetch doctors.",500,undefined,requestId)
    }
}