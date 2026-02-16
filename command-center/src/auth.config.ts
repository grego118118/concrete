
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

            console.log(`[Auth] Checking path: ${pathname}, LoggedIn: ${isLoggedIn}`);

            // Paths that don't require authentication
            // Check for both direct and rewritten paths (Vercel rewrites /app to /command-center/app)
            const isLoginPath = pathname === '/login' || pathname.endsWith('/login');
            const isErrorPath = pathname === '/error' || pathname.endsWith('/error');
            const isAuthApi = pathname.includes('/api/auth');

            if (isLoginPath || isAuthApi || isErrorPath) {
                // If logged in and hitting login, go to the dashboard
                if (isLoggedIn && isLoginPath) {
                    return Response.redirect(new URL('/app', nextUrl));
                }
                return true;
            }

            // Everything else in the app context requires authentication
            // This will match /app, /crm, /quotes, etc.
            return isLoggedIn;
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
