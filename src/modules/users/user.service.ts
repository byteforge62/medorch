import { findUserById,findUserByEmail,findUsers } from "./user.repository";
import type { UserRole, UserStatus } from "@/generated/prisma/enums";
import { hashPassword } from "@/lib/auth/password";
import { recordAudit } from "../audit/audit.service";
import { createUserRecord } from "./user.repository";
import { generateEmailVerificationToken,hashEmailVerificationToken,getEmailVerificationExpiry } from "@/lib/auth/email-verification";
import { createPatientRegistrationRecord } from "./user.repository";
import type { PatientRegistrationInput } from "./user.validation";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { verifyPatientEmail } from "./user.repository";

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

export async function registerPatient(input: PatientRegistrationInput) {
  const passwordHash = await hashPassword(input.password);

  const token = generateEmailVerificationToken();
  const tokenHash = hashEmailVerificationToken(token);
  const expiresAt = getEmailVerificationExpiry();

  const user = await createPatientRegistrationRecord({
    name: input.name,
    email: input.email,
    passwordHash,
    phone: input.phone,
    tokenHash,
    expiresAt,
  });

  await sendVerificationEmail(user.email, user.name, token);

  return {
    id: user.id,
    email: user.email,
    status: user.status,
    message: "Registration successful. Check your email to verify your account.",
  };
}


export async function verifyPatientEmailToken(token: string) {
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return { verified: false };
  }

  const tokenHash = hashEmailVerificationToken(token);
  const verified = await verifyPatientEmail(tokenHash);

  return { verified };
}
