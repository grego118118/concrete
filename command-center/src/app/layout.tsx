import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/session-provider";
import { Toaster } from "sonner";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { headers } from "next/headers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Pioneer Command Center",
    description: "Internal management tool for Pioneer Concrete Coatings",
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await auth();
    const headerList = await headers();
    const pathname = headerList.get("x-invoke-path") || "";
    
    // Emergency protection: If no session, redirect to login unless on public paths
    const isPublicPath = 
        pathname.includes("/login") || 
        pathname.includes("/api/auth") || 
        pathname.includes("/error") ||
        pathname.startsWith("/quote");

    if (!session && !isPublicPath) {
        redirect("/app/login");
    }

    return (
        <html lang="en">
            <body className={inter.className}>
                <SessionProviderWrapper>
                    {children}
                    <Toaster richColors position="top-center" />
                </SessionProviderWrapper>
            </body>
        </html>
    );
}
