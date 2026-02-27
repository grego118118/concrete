import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

const { auth } = NextAuth(authConfig)

export const proxy = auth

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    // Only protect /app/ routes — /quote/ is public for customer access
    matcher: ['/app/:path*'],
};
