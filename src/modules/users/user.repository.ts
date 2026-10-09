import { prisma } from "@/lib/db/prisma";

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