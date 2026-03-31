'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

import { sendEmail } from "@/lib/mailer";

export async function acceptQuote(id: string, scheduledDate: string) {
    try {
        const quote = await db.quote.findUnique({
            where: { id },
            include: {
                customer: true
            }
        });

        if (!quote) return { error: "Quote not found" };

        // Only accept if it's currently SENT or DRAFT
        if (quote.status !== "SENT" && quote.status !== "DRAFT") {
            return { alreadyAccepted: true };
        }

        // Transaction: Update quote status AND create/update Job
        await db.$transaction(async (tx) => {
            // 1. Update Quote
            await tx.quote.update({
                where: { id },
                data: {
                    status: "APPROVED" as any,
                    scheduledDate: scheduledDate ? new Date(scheduledDate) : null
                }
            });

            // 2. Create or Update Job (Idempotent)
            await tx.job.upsert({
                where: { quoteId: quote.id },
                create: {
                    title: `${quote.customer.name} - Project`,
                    description: `Project generated from Quote #${quote.number}`,
                    status: "SCHEDULED",
                    customerId: quote.customerId,
                    businessId: quote.customer.businessId,
                    quoteId: quote.id,
                    scheduledAt: scheduledDate ? new Date(scheduledDate) : null,
                },
                update: {
                    scheduledAt: scheduledDate ? new Date(scheduledDate) : null,
                }
            });
        });

        // 3. Create CRM invoice, Stripe payment link, then QB invoice for bookkeeping
        console.log(`[acceptQuote] Creating invoice and payment link for Quote ${id}`);
        let paymentLink: string | undefined;

        try {
            const { createInvoiceFromQuote } = await import("@/lib/quickbooks/invoice-sync");
            const invoice = await createInvoiceFromQuote(id);

            // Create Stripe payment link for the deposit amount
            const { createDepositPaymentLink } = await import("@/lib/stripe/payment-link");
            const stripeLink = await createDepositPaymentLink({
                quoteNumber: quote.number,
                depositAmount: Number(quote.deposit),
                quoteId: id,
                invoiceId: invoice.id,
            });

            if (stripeLink) {
                paymentLink = stripeLink;
                await db.invoice.update({
                    where: { id: invoice.id },
                    data: { paymentLink: stripeLink },
                });
            }

            // Sync to QB in the background for bookkeeping (non-blocking)
            import("@/lib/quickbooks/invoice-sync")
                .then(({ createQBInvoice }) => createQBInvoice(id))
                .catch(err => console.warn('[acceptQuote] QB sync failed (non-critical):', err));

        } catch (err) {
            console.error('[acceptQuote] Invoice/payment link creation failed:', err);
        }

        // 4. Send Confirmation Email IMMEDIATELY
        console.log(`[acceptQuote] Sending confirmation email to ${quote.customer.email}`);
        try {
            await sendEmail({
                to: quote.customer.email,
                subject: `Project Confirmed! (Quote #${quote.number})`,
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                        <h2 style="color: #0f172a;">Project Confirmed!</h2>
                        <p>Hi ${quote.customer.name},</p>
                        <p>Great news! We've received your acceptance for Quote #${quote.number}.</p>
                        ${scheduledDate ? `<p><strong>Scheduled Start Date:</strong> ${new Date(scheduledDate).toLocaleDateString()}</p>` : ""}
                        
                        ${paymentLink ? `
                        <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                            <p style="color: #166534; font-weight: 700; font-size: 16px; margin: 0 0 12px;">Ready to pay the deposit?</p>
                            <a href="${paymentLink}" 
                               style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 6px rgba(34, 197, 94, 0.2);">
                                Pay 50% Deposit
                            </a>
                        </div>
                        ` : `
                        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin: 24px 0;">
                            <p style="color: #475569; margin: 0;">We're currently finalizing your secure payment portal. Keep an eye on your inbox—a separate email with your invoice and payment link will be with you shortly.</p>
                        </div>
                        `}

                        <br/>
                        <p>Thank you,<br/>Pioneer Concrete Coatings</p>
                    </div>
                `
            });
        } catch (error) {
            console.error("[acceptQuote] Email failed (critical):", error);
        }

        revalidatePath(`/quote/${id}`);
        revalidatePath(`/app/crm/jobs`);
        revalidatePath(`/app/crm/invoices`);

        return { success: true };
    } catch (err: any) {
        console.error("[acceptQuote] CRITICAL FAILURE:", err);
        return { error: err.message || "Failed to process quote acceptance" };
    }
}

export async function getQuotePaymentStatus(id: string) {
    const quote = await db.quote.findUnique({
        where: { id },
        include: { invoice: true }
    });
    return {
        status: quote?.status,
        invoiceStatus: quote?.invoice?.status,
        paymentLink: quote?.invoice?.paymentLink
    };
}
