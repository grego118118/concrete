
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/app/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const pathname = nextUrl.pathname;
            const isLoggedIn = !!auth?.user;

            // Identify if the request is intended for the command-center app
            const isAppPath = pathname.startsWith('/app');
            const isLoginPath = pathname === '/login' || pathname === '/app/login';
            const isAuthApi = pathname.startsWith('/api/auth');

            // In production, everything outside /app, /login, or /api/auth should fall through 
            // to the Vite marketing site at the root.
            if (process.env.NODE_ENV === 'production' && !isAppPath && !isLoginPath && !isAuthApi) {
                return true;
            }

            // Public paths that don't require authentication within the app context
            const publicPaths = ['/login', '/app/login'];
            const isPublicPath = publicPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

            if (isPublicPath) {
                // If logged in and hitting login, go to the app dashboard
                if (isLoggedIn) {
                    return Response.redirect(new URL('/app', nextUrl));
                }
                return true;
            }

            // Everything else in the app context requires authentication
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
