import type { UserRole } from "@/generated/prisma/client";

import { requireApiRole } from "../auth/authorization";
import { apiError } from "./response";

export async function authorizeApiRole(roles: UserRole | UserRole[],requestId: string){
    const session = await requireApiRole(roles);
    if(!session){
        return{
            session: null,
            response: apiError("Unauthorized",401,undefined,requestId)
        }
    }

    return {
        session,
        response: null
    }
}