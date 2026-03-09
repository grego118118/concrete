import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/layout/app-sidebar"
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

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
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
                                        <BreadcrumbLink href="/app" className="font-bold text-gray-500 hover:text-blue-600 transition-colors">
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
    )
}
