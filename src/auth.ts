import NextAuth from "next-auth";
import { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { recordAudit } from "./modules/audit/audit.service";

class EmailNotVerifiedError extends CredentialsSignin {
    code = "email_not_verified";
}

class AccountPendingApprovalError extends CredentialsSignin {
    code = "account_pending_approval";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
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


            async authorize(credentials) {
                if (
                    typeof credentials?.email !== "string" ||
                    typeof credentials?.password !== "string"
                ) {
                    return null;
                }

                const email = credentials.email.trim().toLowerCase();

                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    return null;
                }

                const passwordValid = await verifyPassword(
                    credentials.password,
                    user.passwordHash,
                );

                if (!passwordValid) {
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