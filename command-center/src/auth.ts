
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { authConfig } from "./auth.config"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

const { handlers, auth, signIn, signOut } = NextAuth({
    basePath: "/app/api/auth",
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
    ...authConfig,
    providers: [
        Credentials({
            async authorize(credentials) {
                const { email, password } = credentials

                if (!email || !password) {
                    console.log("[Auth] Authorize failed: Missing email or password");
                    return null
                }

                console.log(`[Auth] Authorize attempt for: ${email}`);

                const user = await db.user.findUnique({
                    where: { email: email as string }
                })

                if (!user) {
                    console.log(`[Auth] Authorize failed: User not found for ${email}`);
                    return null
                }

                if (!user.password) {
                    console.log(`[Auth] Authorize failed: User ${email} has no password set`);
                    return null
                }

                const passwordsMatch = await bcrypt.compare(
                    password as string,
                    user.password
                )

                if (passwordsMatch) {
                    console.log(`[Auth] Authorize success: ${email}`);
                    return user
                }

                console.log(`[Auth] Authorize failed: Password mismatch for ${email}`);
                return null
            }
        }),
    ],
})

export { handlers, auth, signIn, signOut }
