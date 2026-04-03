"use server";

import { db } from "@/lib/db";

export async function getDashboardStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const [
        jobsCount,
        lastMonthJobsCount,
        leadsCount,
        lastMonthLeadsCount,
        quotesCount,
        lastMonthQuotesCount,
        fullyPaidTotal,
        depositInvoices,
        allTotal,
        recentCustomers,
        recentJobs,
        recentQuotes,
        recentPayments,
    ] = await Promise.all([
        db.job.count({ where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] } } }),
        db.job.count({ where: { status: { in: ["SCHEDULED", "IN_PROGRESS"] }, createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
        db.customer.count(),
        db.customer.count({ where: { createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
        db.quote.count({ where: { status: { in: ["DRAFT", "SENT"] } } }),
        db.quote.count({ where: { status: { in: ["DRAFT", "SENT"] }, createdAt: { gte: startOfLastMonth, lt: startOfMonth } } }),
        db.invoice.aggregate({ _sum: { amount: true }, where: { status: "PAID" } }),
        db.invoice.findMany({ where: { status: "DEPOSIT_PAID" }, select: { quote: { select: { deposit: true } } } }),
        db.invoice.aggregate({ _sum: { amount: true } }),
        db.customer.findMany({ orderBy: { createdAt: "desc" }, take: 3, select: { id: true, name: true, createdAt: true } }),
        db.job.findMany({ orderBy: { createdAt: "desc" }, take: 3, include: { customer: { select: { name: true } } } }),
        db.quote.findMany({ orderBy: { createdAt: "desc" }, take: 3, include: { customer: { select: { name: true } } } }),
        db.invoice.findMany({
            where: { status: { in: ["PAID", "DEPOSIT_PAID"] }, paidAt: { not: null } },
            orderBy: { paidAt: "desc" },
            take: 3,
            select: { id: true, number: true, amount: true, status: true, paidAt: true, customer: { select: { name: true } } },
        }),
    ]);

    // Build recent activity feed merged and sorted by time
    const activity = [
        ...recentCustomers.map((c) => ({
            type: "customer" as const,
            id: c.id,
            label: c.name,
            detail: "New lead added",
            at: c.createdAt,
        })),
        ...recentJobs.map((j) => ({
            type: "job" as const,
            id: j.id,
            label: j.title,
            detail: `Job ${j.status.toLowerCase().replace("_", " ")} — ${j.customer.name}`,
            at: j.createdAt,
        })),
        ...recentQuotes.map((q) => ({
            type: "quote" as const,
            id: q.id,
            label: `Quote #${q.number}`,
            detail: `${q.status} — ${q.customer.name}`,
            at: q.createdAt,
        })),
        ...recentPayments.map((inv) => ({
            type: "payment" as const,
            id: inv.id,
            label: `$${Number(inv.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} received`,
            detail: `${inv.status === "DEPOSIT_PAID" ? "Deposit" : "Full payment"} — ${inv.customer.name}`,
            at: inv.paidAt!,
        })),
    ]
        .sort((a, b) => b.at.getTime() - a.at.getTime())
        .slice(0, 5);

    return {
        jobsCount,
        jobsDelta: lastMonthJobsCount > 0
            ? Math.round(((jobsCount - lastMonthJobsCount) / lastMonthJobsCount) * 100)
            : null,
        leadsCount,
        leadsDelta: lastMonthLeadsCount > 0
            ? Math.round(((leadsCount - lastMonthLeadsCount) / lastMonthLeadsCount) * 100)
            : null,
        quotesCount,
        quotesDelta: lastMonthQuotesCount > 0
            ? Math.round(((quotesCount - lastMonthQuotesCount) / lastMonthQuotesCount) * 100)
            : null,
        revenue: (
            Number(fullyPaidTotal._sum.amount || 0) +
            depositInvoices.reduce((sum, inv) => sum + Number(inv.quote.deposit), 0)
        ).toFixed(2),
        invoicedTotal: allTotal._sum.amount?.toString() || "0",
        activity,
    };
}
