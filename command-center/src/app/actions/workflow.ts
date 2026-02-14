'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function updateScopeData({
    id,
    type,
    scopeData,
    baseRate,
    totalArea
}: {
    id: string;
    type: 'job' | 'quote';
    scopeData: any;
    baseRate: number;
    totalArea: number;
}) {
    if (type === 'job') {
        await db.job.update({
            where: { id },
            data: {
                scopeData: scopeData as any,
                // Optionally map flat fields if Job model has them
            }
        });
        revalidatePath(`/crm/jobs/${id}`);
    } else {
        // Calculate full pricing including custom items
        const customItems = (scopeData?.customItems || []) as Array<{ sqft: number; rate: number }>;
        const baseCost = totalArea * baseRate;
        const customTotal = customItems.reduce((sum: number, item: any) => sum + (item.sqft * item.rate), 0);

        // Add cleanup fee
        const cleanupFee = scopeData?.jobsiteCleanup ? 150 : 0;
        const subtotal = baseCost + customTotal + cleanupFee;

        // Handle conditional tax
        const applyTax = scopeData?.applyTax ?? true;
        const taxRate = applyTax ? 0.0625 : 0;
        const tax = subtotal * taxRate;

        const total = subtotal + tax;
        const deposit = total * 0.5;
        const balance = total - deposit;

        await db.quote.update({
            where: { id },
            data: {
                scopeData: scopeData as any,
                scopeArea: totalArea,
                subtotal: subtotal,
                tax: tax,
                total: total,
                deposit: deposit,
                balance: balance,
            }
        });
        revalidatePath(`/crm/quotes/${id}`);
    }
}

export async function convertQuoteToJob(quoteId: string) {
    const quote = await db.quote.findUnique({
        where: { id: quoteId },
        include: {
            photos: true,
            customer: true
        }
    });

    if (!quote) throw new Error("Quote not found");

    // Create Job from Quote data
    const job = await db.job.create({
        data: {
            title: `Job for ${quote.customer.name} (Quote #${quote.number})`,
            customerId: quote.customerId,
            businessId: quote.customer.businessId,
            status: 'SCHEDULED',
            scopeData: quote.scopeData || {},
            quoteId: quote.id,
            photos: {
                connect: quote.photos.map(p => ({ id: p.id }))
            }
        }
    });

    // Update quote status
    await db.quote.update({
        where: { id: quoteId },
        data: { status: 'APPROVED' }
    });

    revalidatePath(`/crm/quotes/${quoteId}`);
    revalidatePath(`/crm/jobs`);

    return job;
}
