
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { db } from "@/lib/db"
import { authConfig } from "./auth.config"
import Nodemailer from "next-auth/providers/nodemailer"

const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: PrismaAdapter(db),
    session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
    ...authConfig,
    providers: [
        Nodemailer({
            server: {
                host: process.env.SMTP_HOST,
                port: Number(process.env.SMTP_PORT || "587"),
                auth: {
                    user: process.env.SMTP_USER,
                    pass: process.env.SMTP_PASS,
                },
                secure: process.env.SMTP_PORT === "465",
            },
            from: process.env.SMTP_FROM_NAME ? `"${process.env.SMTP_FROM_NAME}" <${process.env.SMTP_USER}>` : process.env.SMTP_USER,
        }),
    ],
})

export { handlers, auth, signIn, signOut }
