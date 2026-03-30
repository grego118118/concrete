"use client"

import * as React from "react"
import {
    BookOpen,
    Command,
    LayoutDashboard,
    Settings2,
    SquareTerminal,
    Users,
    Share2,
} from "lucide-react"


import { NavMain } from "@/components/layout/nav-main"
import { NavUser } from "@/components/layout/nav-user"
import { TeamSwitcher } from "@/components/layout/team-switcher"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarRail,
    useSidebar,
} from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"


// This is sample data.
const data = {
    user: {
        name: "Greg",
        email: "greg@pioneer.com",
        avatar: "/avatars/shadcn.jpg",
    },
    teams: [
        {
            name: "Pioneer Concrete",
            logo: Command,
            plan: "Enterprise",
        },
    ],
    navMain: [
        {
            title: "Dashboard",
            url: "/app",
            icon: LayoutDashboard,
            isActive: true,
        },
        {
            title: "Customers",
            url: "/app/crm/customers",
            icon: Users,
        },
        {
            title: "Jobs",
            url: "/app/crm/jobs",
            icon: SquareTerminal,
        },
        {
            title: "Quotes & Invoices",
            url: "/app/crm/quotes",
            icon: BookOpen,
        },
        {
            title: "Social Hub",
            url: "/app/social/composer",
            icon: Share2,
        },
        {
            title: "CRM Settings",
            url: "/app/crm/settings",
            icon: Settings2,
        },
        {
            title: "Sync Diagnostics",
            url: "/app/crm/diagnostics",
            icon: SquareTerminal,
        },
    ],

}


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const { isMobile } = useSidebar()
    const { data: session, status } = useSession() || { data: null, status: "unauthenticated" }

    console.log("AppSidebar Session:", { session, status })

    const user = {
        name: session?.user?.name || session?.user?.email?.split('@')[0] || "User",
        email: session?.user?.email || "",
        avatar: session?.user?.image || "",
    }

    return (
        <Sidebar
            collapsible={isMobile ? "offcanvas" : "none"}
            className={cn("border-r print:hidden", !isMobile && "h-screen sticky top-0 bg-white")}
            {...props}
        >
            <SidebarHeader className="border-b px-6 py-4 bg-white">
                <TeamSwitcher teams={data.teams} />
            </SidebarHeader>
            <SidebarContent className="bg-white">
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter className="border-t bg-white">
                <NavUser user={user} />
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    )
}
