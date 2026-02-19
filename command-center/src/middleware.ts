
import NextAuth from "next-auth"
import { authConfig } from "./auth.config"

export default NextAuth(authConfig).auth

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    // Only protect /app/ routes — /quote/ is public for customer access
    matcher: ['/app/:path*'],
};
