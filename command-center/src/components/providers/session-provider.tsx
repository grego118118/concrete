"use client"

import { Session } from "next-auth"
import { SessionProvider } from "next-auth/react"

export default function SessionProviderWrapper({
    children,
    session,
}: {
    children: React.ReactNode
    session?: Session | null
}) {
    return <SessionProvider session={session} basePath="/app/api/auth">{children}</SessionProvider>
}
