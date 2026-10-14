import { prisma } from "@/lib/db/prisma";
import { UserRole, UserStatus } from "@/generated/prisma/enums";
import { randomUUID } from "node:crypto";

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

type CreatePatientRegistrationRecordInput = {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  tokenHash: string;
  expiresAt: Date;
};

export async function createPatientRegistrationRecord(
  input: CreatePatientRegistrationRecordInput
) {
  const patientCode = `PAT-${randomUUID().replaceAll("-", "").toUpperCase()}`;

  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: input.passwordHash,
      phone: input.phone,
      role: UserRole.PATIENT,
      status: UserStatus.PENDING,
      patient: {
        create: {
          patientCode,
          name: input.name,
          email: input.email,
          phone: input.phone,
        },
      },
      emailVerificationTokens: {
        create: {
          tokenHash: input.tokenHash,
          expiresAt: input.expiresAt,
        },
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      emailVerifiedAt: true,
      createdAt: true,
    },
  });
} 


export async function verifyPatientEmail(tokenHash: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const verificationToken = await tx.emailVerificationToken.findUnique({
      where: { tokenHash },
      select: {
        userId: true,
        expiresAt: true,
        user: {
          select: {
            emailVerifiedAt: true,
          },
        },
      },
    });

    if (!verificationToken) {
      return false;
    }

    if (verificationToken.expiresAt <= new Date()) {
      await tx.emailVerificationToken.deleteMany({
        where: { tokenHash },
      });

      return false;
    }

    if (!verificationToken.user.emailVerifiedAt) {
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: { emailVerifiedAt: new Date() },
      });
    }

    // Invalidate all outstanding verification tokens for this user.
    await tx.emailVerificationToken.deleteMany({
      where: { userId: verificationToken.userId },
    });

    return true;
  });
}
