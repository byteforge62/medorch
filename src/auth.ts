import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { createHash, randomUUID } from "node:crypto";
import { isLoginAttemptAllowed, recordVerificationEmailRequest } from "./modules/users/user.repository";
import { prisma } from "@/lib/db/prisma";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { UserRole, UserStatus } from "@/generated/prisma/enums";
import { recordAudit } from "./modules/audit/audit.service";

class EmailNotVerifiedError extends CredentialsSignin {
    code = "email_not_verified";
}

class AccountPendingApprovalError extends CredentialsSignin {
    code = "account_pending_approval";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    pages: {
        signIn: "/login",
        error: "/login",
    },

    providers: [
        /*
         * Google is an identity check, not an access grant. The sign-in
         * callback below still resolves the MedOrch account by email and
         * applies the same status and approval rules as password sign-in.
         * Credentials come from AUTH_GOOGLE_ID / AUTH_GOOGLE_SECRET.
         */
        Google({
            clientId: process.env.AUTH_GOOGLE_ID ?? "",
            clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
            allowDangerousEmailAccountLinking: true,
        }),

        Credentials({
            credentials: {
                email: {
                    label: "Email",
                    type: "email"
                },
                password: {
                    label: "Password",
                    type: "password"
                }
            },


            async authorize(credentials, request) {
                if (
                    typeof credentials?.email !== "string" ||
                    typeof credentials?.password !== "string"
                ) {
                    return null;
                }

                const email = credentials.email.trim().toLowerCase();

                const forwardedFor = request.headers.get("x-forwarded-for");
                const clientIp = forwardedFor?.split(",")[0]?.trim() || "unknown";

                const emailHash = createHash("sha256")
                    .update(email)
                    .digest("hex");

                const ipHash = createHash("sha256")
                    .update(clientIp)
                    .digest("hex");

                if (!(await isLoginAttemptAllowed(emailHash, ipHash))) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                const passwordValid = user
                    ? await verifyPassword(credentials.password, user.passwordHash)
                    : false;

                if (!user || !passwordValid) {
                    await recordVerificationEmailRequest(
                        emailHash,
                        ipHash,
                        "LOGIN_ATTEMPT",
                    );

                    return null;
                }

                if (user.role === "PATIENT" && !user.emailVerifiedAt) {
                    throw new EmailNotVerifiedError();
                }

                if (user.status !== "ACTIVE") {
                    throw new AccountPendingApprovalError();
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    sessionVersion: user.sessionVersion
                };
            }

        })
    ],

    session: {
        strategy: "jwt"
    },

    callbacks: {
        async signIn({ user, account, profile }) {
            if (account?.provider !== "google") {
                return true;
            }

            const email = user.email?.trim().toLowerCase();

            if (!email) {
                return "/login?error=google_no_email";
            }

            const existing = await prisma.user.findUnique({
                where: { email },
            });

            /*
             * A first Google sign-in creates a patient account in the same
             * pending state as email registration. It cannot sign in until
             * an administrator approves it, so OAuth never bypasses the
             * approval boundary. Google has already verified the address.
             */
            if (!existing) {
                const displayName =
                    (typeof profile?.name === "string" && profile.name.trim()) ||
                    user.name?.trim() ||
                    email.split("@")[0];

                const passwordHash = await hashPassword(
                    `${randomUUID()}${randomUUID()}`,
                );

                await prisma.user.create({
                    data: {
                        name: displayName,
                        email,
                        passwordHash,
                        role: UserRole.PATIENT,
                        status: UserStatus.PENDING,
                        emailVerifiedAt: new Date(),
                        patient: {
                            create: {
                                patientCode: `PAT-${randomUUID()
                                    .replaceAll("-", "")
                                    .toUpperCase()}`,
                                name: displayName,
                                email,
                            },
                        },
                    },
                });

                return "/login?error=account_pending_approval";
            }

            if (existing.status !== "ACTIVE") {
                return "/login?error=account_pending_approval";
            }

            if (existing.role === "PATIENT" && !existing.emailVerifiedAt) {
                return "/login?error=email_not_verified";
            }

            /* The session is always keyed to the MedOrch record, never to the
               Google subject, so permissions and audit attribution stay ours. */
            const sessionUser = user as typeof user & {
                role: string;
                status: string;
                sessionVersion: number;
            };

            sessionUser.id = existing.id;
            sessionUser.name = existing.name;
            sessionUser.email = existing.email;
            sessionUser.role = existing.role;
            sessionUser.status = existing.status;
            sessionUser.sessionVersion = existing.sessionVersion;

            return true;
        },

        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role;
                token.status = user.status;

                if (
                    "sessionVersion" in user &&
                    typeof user.sessionVersion === "number"
                ) {
                    token.sessionVersion = user.sessionVersion;
                }
            }

            if (typeof token.id === "string") {
                const currentUser = await prisma.user.findUnique({
                    where: { id: token.id },
                    select: {
                        sessionVersion: true,
                        status: true,
                    },
                });

                if (
                    !currentUser ||
                    currentUser.status !== "ACTIVE" ||
                    typeof token.sessionVersion !== "number" ||
                    currentUser.sessionVersion !== token.sessionVersion
                ) {
                    token.invalidated = true;
                } else {
                    token.invalidated = false;
                    token.sessionVersion = currentUser.sessionVersion;
                }
            }

            return token;
        },

        async session({ session, token }) {
            if (token.invalidated === true) {
                session.user = undefined;
                return session;
            }

            if (session.user) {
                session.user.id = token.id as string;
                session.user.role = token.role;
                session.user.status = token.status;
            }

            return session;
        },
    },

    events: {
        async signIn({ user }) {
            try {
                await recordAudit({
                    userId: user.id,
                    action: "LOGIN",
                    entity: "User",
                    entityId: user.id,
                    description: `User "${user.email}" signed in.`,
                    metadata: {
                        email: user.email,
                    },
                });
            } catch (error) {
                console.error(
                    "Failed to record login audit event:",
                    error,
                );
            }
        },

        async signOut(event) {
            const token =
                "token" in event
                    ? event.token
                    : null;

            const userId =
                typeof token?.id === "string"
                    ? token.id
                    : typeof token?.sub === "string"
                        ? token.sub
                        : undefined;

            if (!userId) {
                return;
            }

            try {
                await recordAudit({
                    userId,
                    action: "LOGOUT",
                    entity: "User",
                    entityId: userId,
                    description: "User signed out.",
                });
            } catch (error) {
                console.error(
                    "Failed to record logout audit event:",
                    error,
                );
            }
        },
    },
})