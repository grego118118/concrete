import NextAuth from "next-auth"
import { authConfig } from "./src/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export const proxy = auth((req) => {
    const { nextUrl } = req;
    
    const response = NextResponse.next();
    response.headers.set('x-auth-proxy', 'active-root-v16');
    
    if (nextUrl.pathname.includes('diagnostic/auth-check')) {
        return NextResponse.json({
            status: "INTERCEPTED",
            message: "Success! Root-level Next.js 16 proxy is active",
            file: "command-center/proxy.ts"
        }, {
            headers: { 'x-auth-proxy': 'intercepted-root-v16' }
        });
    }

    return response;
});

export const config = {
    matcher: ['/:path*'],
};
