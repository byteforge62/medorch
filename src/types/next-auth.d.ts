import type { UserRole, UserStatus } from "@/generated/prisma/client";

declare module "next-auth" {
  interface User {
    id: string;
    role: UserRole;
    status: UserStatus;
    sessionVersion?: number;
  }

  interface Session {
    user: {
      id: string;
      role: UserRole;
      status: UserStatus;
    } & Session["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
    status?: UserStatus;
    sessionVersion?: number;
    invalidated?: boolean;
  }
}