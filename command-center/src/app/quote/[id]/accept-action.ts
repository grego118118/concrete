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

    // 3. Create invoice and sync to QuickBooks (blocking here to get payment link for email)
    let paymentLink: string | undefined;
    try {
        const { createInvoiceFromQuote } = await import("@/lib/quickbooks/invoice-sync");
        const invoice = await createInvoiceFromQuote(id);
        
        // Wait up to 5 seconds for the background sync to populate paymentLink
        // (In a real production app, we might use a webhook or more robust polling,
        // but for this flow, a small delay is usually enough for the QB API response)
        for (let i = 0; i < 5; i++) {
            const updatedInvoice = await db.invoice.findUnique({ where: { id: (invoice as any).id } });
            if (updatedInvoice?.paymentLink) {
                paymentLink = updatedInvoice.paymentLink;
                break;
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    } catch (err) {
        console.warn('[acceptQuote] QB invoice sync failed (non-critical):', err);
    }

    // 4. Send Confirmation Email
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
                    
                    ${paymentLink ? `
                    <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                        <p style="color: #166534; font-weight: 700; font-size: 16px; margin: 0 0 12px;">Ready to pay the deposit?</p>
                        <a href="${paymentLink}" 
                           style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2);">
                            Pay 50% Deposit via QuickBooks
                        </a>
                        <p style="color: #15803d; font-size: 12px; margin-top: 10px;">To lock in your scheduled date</p>
                    </div>
                    ` : `
                    <p>We'll be in touch shortly to coordinate final details and provide a payment link for the deposit.</p>
                    `}

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
    revalidatePath(`/app/crm/invoices`);

    return { success: true };
}

export async function getQuotePaymentStatus(id: string) {
    const quote = await db.quote.findUnique({
        where: { id },
        include: { invoice: true }
    });
    return {
        status: quote?.status,
        paymentLink: quote?.invoice?.paymentLink
    };
}
