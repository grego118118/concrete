"use server";

import { db } from "@/lib/db";

export async function getDashboardStats() {
    const [jobsCount, leadsCount, quotesCount, invoiceTotal] = await Promise.all([
        db.job.count({
            where: { status: "IN_PROGRESS" }
        }),
        db.customer.count({
            where: { leadSource: { not: "MANUAL" } } // Approximation for leads
        }),
        db.quote.count({
            where: { status: "DRAFT" }
        }),
        db.invoice.aggregate({
            _sum: {
                amount: true
            },
            where: {
                status: "PAID"
            }
        })
    ]);

    return {
        jobsCount: jobsCount || 0,
        leadsCount: leadsCount || 0,
        quotesCount: quotesCount || 0,
        revenue: invoiceTotal._sum.amount?.toString() || "0"
    };
}
