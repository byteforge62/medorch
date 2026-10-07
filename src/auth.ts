import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

import { prisma } from "@/lib/db/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { recordAudit } from "./modules/audit/audit.service";

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
                if (typeof credentials?.email !== "string" || typeof credentials?.password !== "string") {
                    return null;
                }

                const email = credentials.email.trim().toLowerCase();

                const user = await prisma.user.findUnique({
                    where: {
                        email,
                    }
                });

                if (!user) {
                    return null
                }

                if (user.status !== "ACTIVE") {
                    return null;
                }

                const passwordValid = await verifyPassword(credentials.password, user.passwordHash);

                if (!passwordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status
                }
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
            }

            return token;
        },

        async session({ session, token }) {
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