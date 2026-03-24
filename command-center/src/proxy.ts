import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export const proxy = auth

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    // Protect both front-facing /app/ and Vercel-rewritten /command-center/app/
    matcher: [
        '/app/:path*',
        '/app',
        '/command-center/app/:path*',
        '/command-center/app'
    ],
};
