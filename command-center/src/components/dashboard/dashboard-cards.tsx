"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Briefcase,
    Users,
    FileText,
    DollarSign,
    ArrowRight
} from "lucide-react";

interface DashboardStats {
    jobsCount: number;
    leadsCount: number;
    quotesCount: number;
    revenue: string;
}

export function DashboardCards({ stats }: { stats: DashboardStats }) {
    const router = useRouter();

    const cards = [
        {
            title: "Active Jobs",
            description: "Manage ongoing installations and schedules",
            icon: Briefcase,
            href: "/crm/jobs",
            color: "text-blue-600",
            bgColor: "bg-blue-100",
            borderColor: "border-blue-600",
            stats: `${stats.jobsCount} In Progress`
        },
        {
            title: "Leads",
            description: "Track new inquiries and opportunities",
            icon: Users,
            href: "/crm/leads",
            color: "text-indigo-600",
            bgColor: "bg-indigo-100",
            borderColor: "border-indigo-600",
            stats: `${stats.leadsCount} Active`
        },
        {
            title: "Active Quotes",
            description: "Review and send proposals",
            icon: FileText,
            href: "/crm/quotes",
            color: "text-amber-600",
            bgColor: "bg-amber-100",
            borderColor: "border-amber-600",
            stats: `${stats.quotesCount} Pending`
        },
        {
            title: "Revenue",
            description: "View financial performance and invoices",
            icon: DollarSign,
            href: "/crm/invoices",
            color: "text-emerald-600",
            bgColor: "bg-emerald-100",
            borderColor: "border-emerald-600",
            stats: `$${parseFloat(stats.revenue || "0").toLocaleString()} Total`
        }
    ];

    const handleCardClick = (href: string) => {
        router.push(href);
    };

    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {cards.map((card) => {
                const IconComponent = card.icon;
                return (
                    <Card
                        key={card.title}
                        onClick={() => handleCardClick(card.href)}
                        className={`h-full hover:shadow-xl transition-all duration-200 border-t-4 ${card.borderColor} cursor-pointer hover:-translate-y-1 group`}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                handleCardClick(card.href);
                            }
                        }}
                    >
                        <CardHeader>
                            <div className="flex items-center justify-between mb-2">
                                <div className={`h-12 w-12 ${card.bgColor} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-200`}>
                                    <IconComponent className={`h-6 w-6 ${card.color}`} />
                                </div>
                            </div>
                            <CardTitle className="text-xl group-hover:text-blue-600 transition-colors">
                                {card.title}
                            </CardTitle>
                            <CardDescription>
                                {card.description}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="font-semibold text-2xl text-slate-900 mb-4">
                                {card.stats}
                            </div>
                            <div className="flex items-center text-sm font-medium text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                View Details <ArrowRight className="ml-1 h-4 w-4" />
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
