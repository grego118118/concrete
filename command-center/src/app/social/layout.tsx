"use client"

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ArrowLeft, Share2, LayoutDashboard, PenTool, CalendarDays, MessageSquare, BarChart3, Settings } from "lucide-react";


export default function SocialLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    const navItems = [
        { name: "Overview", href: "/app/social/dashboard", icon: LayoutDashboard },
        { name: "Composer", href: "/app/social/composer", icon: PenTool },
        { name: "Smart Queue", href: "/app/social/queue", icon: CalendarDays },
        { name: "Reviews", href: "/app/social/reviews", icon: MessageSquare },
        { name: "Analytics", href: "/app/social/analytics", icon: BarChart3 },
        { name: "Settings", href: "/app/social/settings", icon: Settings },
    ];

    return (
        <div className="flex flex-col h-full bg-slate-50/50">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between px-6 py-3 bg-white border-b shadow-sm sticky top-0 z-10 rounded-t-2xl">
                <div className="flex items-center gap-4">
                    <Link href="/app" className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500 hover:text-gray-900 group" title="Back to CRM">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-blue-600 rounded-lg shadow-md shadow-blue-200">
                            <Share2 className="h-4 w-4 text-white" />
                        </div>
                        <h2 className="font-black text-sm uppercase tracking-tighter hidden sm:block">Social Reach <span className="text-blue-600 font-medium">Command</span></h2>
                    </div>
                </div>

                <nav className="flex items-center gap-1.5 bg-gray-100/50 p-1.5 rounded-2xl border border-gray-100">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-2.5 px-4 py-2.5 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-tight",
                                    isActive
                                        ? "bg-white text-blue-600 shadow-md shadow-blue-100/20"
                                        : "text-gray-500 hover:text-gray-900 hover:bg-white/50"
                                )}
                            >
                                <item.icon className={cn("h-4.5 w-4.5", isActive ? "text-blue-600" : "text-gray-400")} strokeWidth={isActive ? 2.5 : 2} />
                                <span className="hidden lg:inline">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

            </div>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0 p-6 overflow-auto">
                {children}
            </main>
        </div>
    );
}


