import { prisma } from "@/lib/db/prisma";
import { UserRole, UserStatus } from "@/generated/prisma/enums";

export async function findUsers() {
    return prisma.user.findMany({
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            approvedAt: true,
            createdAt: true,
            updatedAt: true,
            doctorProfile: {
                select: {
                    id: true,
                },
            },
        },

    })
}

export async function findUserById(id: string) {
    return prisma.user.findUnique({
        where: {
            id,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            approvedAt: true,
            createdAt: true,
            updatedAt: true,
        }
    })
}

export async function findUserByEmail(email: string) {
    return prisma.user.findUnique({
        where: {
            email,
        }
    })
}

export async function createUserRecord(data: {
    name: string;
    email: string;
    passwordHash: string;
    phone?: string;
    role: UserRole;
    status?: UserStatus;
}) {
    const status: UserStatus = data.status ?? "PENDING";

    return prisma.user.create({
        data: {
            name: data.name,
            email: data.email,
            passwordHash: data.passwordHash,
            phone: data.phone,
            role: data.role,
            status,
            approvedAt: status === "ACTIVE" ? new Date() : null,
        },
        select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            role: true,
            status: true,
            approvedAt: true,
            createdAt: true,
            updatedAt: true,
        },
    });
}