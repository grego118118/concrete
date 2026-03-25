import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/providers/session-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Pioneer Command Center",
    description: "Internal management tool for Pioneer Concrete Coatings",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
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
