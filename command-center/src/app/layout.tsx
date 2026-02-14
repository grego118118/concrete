import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
import SessionProviderWrapper from "@/components/providers/session-provider"
import { Separator } from "@/components/ui/separator"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Menu } from "lucide-react"


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pioneer Concrete Coatings LLC",
  description: "Command Center for Field Operations & Social Marketing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >

        <SessionProviderWrapper>
          <SidebarProvider defaultOpen={true}>
            <AppSidebar />
            <SidebarInset>
              <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-white px-4 sticky top-0 z-30 shadow-sm md:h-16 md:px-6">
                <div className="flex items-center gap-4 w-full">
                  <div className="flex items-center gap-2 md:hidden">
                    <SidebarTrigger className="hover:bg-gray-100 p-2 rounded-lg transition-colors">
                      <Menu className="h-6 w-6 text-gray-700" />
                    </SidebarTrigger>
                    <span className="font-black tracking-tighter text-lg uppercase italic">PIONEER<span className="text-blue-600">CC</span></span>
                  </div>

                  <div className="hidden md:flex items-center gap-2">
                    <SidebarTrigger className="-ml-1 text-gray-500 hover:text-gray-900 transition-colors" />
                    <Separator orientation="vertical" className="mr-2 h-4" />
                    <Breadcrumb>
                      <BreadcrumbList>
                        <BreadcrumbItem>
                          <BreadcrumbLink href="/" className="font-bold text-gray-500 hover:text-blue-600 transition-colors">
                            Command Center
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                          <BreadcrumbPage className="font-black tracking-tight text-gray-900 uppercase">Dashboard</BreadcrumbPage>
                        </BreadcrumbItem>
                      </BreadcrumbList>
                    </Breadcrumb>
                  </div>
                </div>
              </header>
              <div className="flex flex-1 flex-col gap-0 min-h-0 bg-slate-50/50">
                {children}
              </div>
            </SidebarInset>
          </SidebarProvider>
        </SessionProviderWrapper>

        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
