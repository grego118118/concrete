import NextAuth from "next-auth"
import { authConfig } from "./auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

// Multi-version compatibility for Next.js 16 (proxy) and Next.js 15 (middleware)
// This ensures the auth guard is applied at the edge layer
export const proxy = auth((req) => {
    console.log(`[Auth Proxy] Intercepted: ${req.nextUrl.pathname}`);
    
    // Create the base response (which may include redirects from authConfig)
    const response = NextResponse.next();
    
    // Add diagnostic headers to verify middleware execution on production
    response.headers.set('x-auth-proxy', 'active');
    response.headers.set('x-proxy-timestamp', new Date().toISOString());
    
    return response;
});

// Redundant export for backwards compatibility
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
