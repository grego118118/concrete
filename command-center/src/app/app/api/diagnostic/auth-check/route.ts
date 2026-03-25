import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { cookies, headers } from "next/headers"

export async function GET() {
    try {
        const session = await auth()
        const cookieStore = await cookies()
        const headerList = await headers()
        
        const allCookies = cookieStore.getAll().map(c => ({
            name: c.name,
            valuePreview: c.value.substring(0, 20) + "..."
        }))
        
        return NextResponse.json({
            timestamp: new Date().toISOString(),
            hasSession: !!session,
            sessionUser: session?.user ? {
                email: session.user.email,
                id: session.user.id,
            } : null,
            cookies: allCookies,
            host: headerList.get("host"),
            url: headerList.get("x-forwarded-for"),
            proxyRan: headerList.get("x-auth-proxy") || "no header",
            proxyTimestamp: headerList.get("x-proxy-timestamp") || "N/A",
        })
    } catch (error: any) {
        return NextResponse.json({
            error: error.message,
            stack: error.stack?.split("\n").slice(0, 5),
        }, { status: 500 })
    }
}
