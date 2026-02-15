
import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: '/login',
    },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;

            // Public paths that don't require authentication
            const publicPaths = ['/login'];
            const isPublicPath = publicPaths.some(path => nextUrl.pathname.startsWith(path));

            // If on a public path and already logged in, redirect to dashboard
            if (isPublicPath && isLoggedIn) {
                return Response.redirect(new URL('/', nextUrl));
            }

            // If on a public path, allow access
            if (isPublicPath) {
                return true;
            }

            // Everything else requires authentication
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
