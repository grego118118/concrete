
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

                if (!email || !password) return null

                const user = await db.user.findUnique({
                    where: { email: email as string }
                })

                if (!user || !user.password) return null

                const passwordsMatch = await bcrypt.compare(
                    password as string,
                    user.password
                )

                if (passwordsMatch) return user

                return null
            }
        }),
    ],
})

export { handlers, auth, signIn, signOut }
