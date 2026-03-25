import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
    const { nextUrl } = req;
    
    // DIRECT INTERCEPT for diagnostic verification
    if (nextUrl.pathname.includes('diagnostic/auth-check')) {
        return NextResponse.json({
            status: "INTERCEPTED",
            message: "Authentication proxy is DIRECTLY RUNNING",
            timestamp: new Date().toISOString(),
            pathname: nextUrl.pathname,
            file: "proxy.ts",
            isLoggedIn: !!req.auth?.user
        }, {
            headers: { 'x-auth-proxy': 'confirmed-active' }
        });
    }

    // Default behavior
    const response = NextResponse.next();
    response.headers.set('x-auth-proxy', 'active');
    return response;
});

export const middleware = proxy;

export const config = {
    matcher: [
        '/app/:path*',
        '/app',
        '/command-center/app/:path*',
        '/command-center/app',
        '/api/app/:path*'
    ],
};
