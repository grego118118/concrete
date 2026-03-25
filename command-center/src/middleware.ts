import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
    const { nextUrl } = req;
    if (nextUrl.pathname.includes('diagnostic/auth-check')) {
        return NextResponse.json({
            status: "INTERCEPTED",
            file: "command-center/src/middleware.ts",
            isLoggedIn: !!req.auth?.user
        }, { headers: { 'x-auth-proxy': 'confirmed' } });
    }
    const response = NextResponse.next();
    response.headers.set('x-auth-proxy', 'active');
    return response;
});

export const middleware = proxy;

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
