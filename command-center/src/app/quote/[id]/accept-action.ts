'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { sendEmail } from "@/lib/mailer";

export async function acceptQuote(id: string, scheduledDate: string) {
    const quote = await db.quote.findUnique({
        where: { id },
        include: {
            customer: true
        }
    });

    if (!quote) throw new Error("Quote not found");

    // Only accept if it's currently SENT or DRAFT
    if (quote.status !== "SENT" && quote.status !== "DRAFT") {
        return { alreadyAccepted: true };
    }

    // Transaction: Update quote status AND create Job
    await db.$transaction(async (tx) => {
        // 1. Update Quote
        await tx.quote.update({
            where: { id },
            data: {
                status: "APPROVED" as any,
                scheduledDate: scheduledDate ? new Date(scheduledDate) : null
            }
        });

        // 2. Create Job
        await tx.job.create({
            data: {
                title: `${quote.customer.name} - Project`,
                description: `Project generated from Quote #${quote.number}`,
                status: "SCHEDULED",
                customerId: quote.customerId,
                businessId: quote.customer.businessId,
                quoteId: quote.id,
                scheduledAt: scheduledDate ? new Date(scheduledDate) : null,
            }
        });
    });

    // 3. Send Confirmation Email
    try {
        await sendEmail({
            to: quote.customer.email,
            subject: `Project Confirmed! (Quote #${quote.number})`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <h2 style="color: #0f172a;">Project Confirmed!</h2>
                    <p>Hi ${quote.customer.name},</p>
                    <p>Great news! We've received your acceptance for Quote #${quote.number}.</p>
                    <p><strong>Scheduled Start Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</p>
                    <p>We'll be in touch shortly to coordinate final details.</p>
                    <br/>
                    <p>Thank you,<br/>Pioneer Concrete Coatings</p>
                </div>
            `
        });
    } catch (error) {
        console.error("Failed to send confirmation email:", error);
        // Don't fail the request if email fails, but log it
    }

    revalidatePath(`/quote/${id}`);
    revalidatePath(`/app/crm/jobs`); // Revalidate jobs list
    return { success: true };
}
