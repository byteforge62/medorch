import { redirect } from "next/navigation";

import { auth } from "@/auth";
import type { UserRole } from "@/generated/prisma/client";

import { hasPermission, type Permission } from "./permission";

export async function requireAuth() {
    const session = await auth();

    if(!session?.user){
        redirect("/login")
    }
    return session;
}

export async function requireRole(roles: UserRole | UserRole[]){
   const session = await requireAuth();

   const allowedRoles = Array.isArray(roles) ? roles : [roles];
   if(!allowedRoles.includes(session.user.role)){
    redirect("/unauthorized");
   }

   return session;
}

export async function requirePermission(permission: Permission){
    const session = await requireAuth();
    if(!hasPermission(session.user.role,permission)){
        redirect("/unauthorized");
    }
    return session;
}