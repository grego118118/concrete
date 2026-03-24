"use server";

import { db } from "@/lib/db";

export async function getDashboardStats() {
    const [jobsCount, leadsCount, quotesCount, paidTotal, allTotal] = await Promise.all([
        db.job.count({
            where: { status: "IN_PROGRESS" }
        }),
        db.customer.count({
            where: { leadSource: { not: "MANUAL" } }
        }),
        db.quote.count({
            where: { status: "DRAFT" }
        }),
        db.invoice.aggregate({
            _sum: { amount: true },
            where: { status: "PAID" }
        }),
        db.invoice.aggregate({
            _sum: { amount: true }
        })
    ]);

    return {
        jobsCount: jobsCount || 0,
        leadsCount: leadsCount || 0,
        quotesCount: quotesCount || 0,
        revenue: paidTotal._sum.amount?.toString() || "0",
        invoicedTotal: allTotal._sum.amount?.toString() || "0"
    };
}
