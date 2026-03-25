
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/app/login',
        error: '/app/error',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const pathname = nextUrl.pathname;
            const isLoggedIn = !!auth?.user;

            // ONLY paths starting with /app require authentication
            const isAppPath = pathname.startsWith('/app');
            const isLoginPath = pathname === '/app/login' || pathname.endsWith('/login');
            const isErrorPath = pathname === '/app/error' || pathname.endsWith('/error');
            const isAuthApi = pathname.includes('/api/auth');

            if (isAppPath) {
                if (isLoginPath || isAuthApi || isErrorPath) {
                    if (isLoggedIn && isLoginPath) {
                        console.log("[Auth] Already logged in, redirecting to /app");
                        return Response.redirect(new URL('/app', nextUrl));
                    }
                    return true;
                }

                if (!isLoggedIn) {
                    console.log("[Auth] Not logged in, redirecting to /app/login");
                    return Response.redirect(new URL('/app/login', nextUrl));
                }
            }

            // Public paths are always authorized
            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id
                // @ts-expect-error - businessId is on user
                token.businessId = user.businessId
                // @ts-expect-error - role is on user
                token.role = user.role
            }
            return token
        },
        async session({ session, token }) {
            if (session?.user && token) {
                if (token.sub) {
                    session.user.id = token.sub
                }

                // @ts-expect-error - custom fields
                session.user.businessId = token.businessId
                // @ts-expect-error - custom fields
                session.user.role = token.role
            }
            return session
        },
    },
    providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
