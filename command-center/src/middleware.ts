import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth({
    basePath: "/app/api/auth",
    ...authConfig,
}).auth;

export const config = {
    matcher: ["/app/:path*"],
};
