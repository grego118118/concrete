import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
    const { nextUrl } = req;
    
    if (nextUrl.pathname.includes('diagnostic/auth-check')) {
        return NextResponse.json({
            status: "INTERCEPTED",
            message: "Authentication proxy is DIRECTLY RUNNING",
            timestamp: new Date().toISOString(),
            pathname: nextUrl.pathname,
            file: "command-center/proxy.ts",
            isLoggedIn: !!req.auth?.user
        }, {
            headers: { 'x-auth-proxy': 'confirmed-active' }
        });
    }

    const response = NextResponse.next();
    response.headers.set('x-auth-proxy', 'active');
    return response;
});

export const middleware = proxy;

export const config = {
    matcher: ['/:path*'], // Catch all for debugging
};
