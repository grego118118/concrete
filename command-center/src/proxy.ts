import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
    const { nextUrl } = req;
    
    // Add a diagnostic header to every request to prove the proxy is running
    const response = NextResponse.next();
    response.headers.set('x-auth-proxy', 'active-v16');
    response.headers.set('x-proxy-timestamp', new Date().toISOString());
    
    // Direct intercept for diagnostic endpoint
    if (nextUrl.pathname.includes('diagnostic/auth-check')) {
        return NextResponse.json({
            status: "INTERCEPTED",
            message: "Success! Next.js 16 proxy is active on Vercel Edge",
            timestamp: new Date().toISOString(),
            isLoggedIn: !!req.auth?.user,
            file: "command-center/src/proxy.ts"
        }, {
            headers: { 'x-auth-proxy': 'intercepted-v16' }
        });
    }

    return response;
});

export const config = {
    matcher: ['/:path*'], // Exhaustive coverage
};
