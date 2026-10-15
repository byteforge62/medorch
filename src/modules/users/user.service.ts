import { createUserRecord, findUserById, findUserByEmail, findUsers, createPatientRegistrationRecord, verifyPatientEmail, approvePendingPatient, createPatientResendVerificationToken, recordVerificationEmailRequest, createPasswordResetToken,resetPasswordWithToken } from "./user.repository";
import type { UserRole, UserStatus } from "@/generated/prisma/enums";
import { hashPassword } from "@/lib/auth/password";
import { recordAudit } from "../audit/audit.service";
import { generateEmailVerificationToken, hashEmailVerificationToken, getEmailVerificationExpiry } from "@/lib/auth/email-verification";
import type { PatientRegistrationInput } from "./user.validation";
import { sendVerificationEmail } from "@/lib/email/send-verification-email";
import { createHash } from "node:crypto";
import { generatePasswordResetToken, hashPasswordResetToken, getPasswordResetExpiry } from "@/lib/auth/password-reset";
import { sendPasswordResetEmail } from "@/lib/email/send-password-reset-email";

export async function getUsers() {
  return findUsers();
}

export async function getUserById(id: string) {
  return findUserById(id);
}

export async function getUserByEmail(email: string) {
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

  try {
    await sendVerificationEmail(user.email, user.name, token);
  } catch (error) {
    console.error("Registration verification email failed:", error);
  }

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

export async function approvePatient(
  patientUserId: string,
  actorUserId: string,
) {
  const patient = await approvePendingPatient(patientUserId);

  await recordAudit({
    userId: actorUserId,
    action: "UPDATE",
    entity: "User",
    entityId: patient.id,
    description: `Patient "${patient.email}" was approved.`,
    metadata: {
      role: patient.role,
      status: patient.status,
      approvedAt: patient.approvedAt?.toISOString() ?? null,
    },
  });

  return patient;
}

export async function resendPatientVerificationEmail(
  email: string,
  ipAddress: string,
) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || normalizedEmail.length > 254) {
    return { accepted: true };
  }

  const emailHash = createHash("sha256")
    .update(normalizedEmail)
    .digest("hex");

  const ipHash = createHash("sha256")
    .update(ipAddress)
    .digest("hex");

  const allowed = await recordVerificationEmailRequest(
    emailHash,
    ipHash,
  );

  if (!allowed) {
    return {
      accepted: true,
      rateLimited: true,
    };
  }

  const token = generateEmailVerificationToken();
  const tokenHash = hashEmailVerificationToken(token);
  const expiresAt = getEmailVerificationExpiry();

  const user = await createPatientResendVerificationToken(
    normalizedEmail,
    tokenHash,
    expiresAt,
  );

  if (user) {
    await sendVerificationEmail(user.email, user.name, token);
  }

  return { accepted: true };
}


export async function requestPasswordReset(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!normalizedEmail || normalizedEmail.length > 254) {
    return { accepted: true };
  }

  const token = generatePasswordResetToken();
  const tokenHash = hashPasswordResetToken(token);
  const expiresAt = getPasswordResetExpiry();

  const user = await createPasswordResetToken(
    normalizedEmail,
    tokenHash,
    expiresAt,
  );

  if (user) {
    await sendPasswordResetEmail(user.email, user.name, token);
  }

  return { accepted: true };
}

export async function completePasswordReset(
  token: string,
  newPassword: string,
) {
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return { reset: false };
  }

  const passwordHash = await hashPassword(newPassword);
  const tokenHash = hashPasswordResetToken(token);

  const reset = await resetPasswordWithToken(tokenHash, passwordHash);

  return { reset };
}
