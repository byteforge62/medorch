import { findUserById,findUserByEmail,findUsers } from "./user.repository";
import type { UserRole, UserStatus } from "@/generated/prisma/enums";
import { hashPassword } from "@/lib/auth/password";
import { recordAudit } from "../audit/audit.service";
import { createUserRecord } from "./user.repository";


export async function getUsers(){
    return findUsers();
}

export async function getUserById(id: string){
    return findUserById(id);
}

export async function getUserByEmail(email: string){
    return findUserByEmail(email);
}

export async function createUser(
    data: {
        name: string;
        email: string;
        password: string;
        phone?: string;
        role: UserRole;
        status?: UserStatus;
    },
    actorUserId: string,
) {
    const passwordHash = await hashPassword(data.password);

    const user = await createUserRecord({
        name: data.name,
        email: data.email,
        passwordHash,
        phone: data.phone,
        role: data.role,
        status: data.status,
    });

    await recordAudit({
        userId: actorUserId,
        action: "CREATE",
        entity: "User",
        entityId: user.id,
        description: `User "${user.email}" was created.`,
        metadata: {
            role: user.role,
            status: user.status,
        },
    });

    return user;
}