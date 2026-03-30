'use server';

import { db } from '@/lib/db';
import { sendEmail } from '@/lib/mailer';
import { createCompletionPaymentLink } from '@/lib/stripe/payment-link';
import { generateInvoicePDF } from '@/lib/pdf-generator';

type OverageItem = {
    description: string;
    quantity: number;
    unitPrice: number;
};

/**
 * Sends a completion invoice to the customer when a job is marked COMPLETED.
 * Covers the remaining balance (quote.balance) plus any overage line items.
 */
export async function sendCompletionInvoice(jobId: string, overageItems: OverageItem[] = []) {
    const job = await db.job.findUnique({
        where: { id: jobId },
        include: {
            customer: true,
            quote: {
                include: {
                    items: true,
                    invoice: true,
                }
            }
        }
    });

    if (!job?.quote?.invoice) {
        console.warn(`[Completion Invoice] No invoice found for job ${jobId}, skipping`);
        return;
    }

    const { quote, customer } = job;
    const invoice = quote.invoice!;

    // Calculate overage total
    const overageTotal = overageItems.reduce(
        (sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0
    );

    // Final amount = remaining balance + overages
    const balance = Number(quote.balance);
    const finalAmount = balance + overageTotal;

    // Save overage items to the invoice
    if (overageItems.length > 0) {
        await db.overageItem.createMany({
            data: overageItems.map(item => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                total: item.quantity * item.unitPrice,
                invoiceId: invoice.id,
            }))
        });
    }

    // Update invoice amount to reflect final balance
    await db.invoice.update({
        where: { id: invoice.id },
        data: {
            amount: finalAmount,
            status: 'SENT' as any,
        }
    });

    // Create Stripe payment link for the final amount
    let completionPaymentLink: string | null = null;
    try {
        completionPaymentLink = await createCompletionPaymentLink({
            quoteNumber: quote.number,
            finalAmount,
            quoteId: quote.id,
            invoiceId: invoice.id,
        });

        if (completionPaymentLink) {
            await db.invoice.update({
                where: { id: invoice.id },
                data: {
                    completionPaymentLink,
                    completionSentAt: new Date(),
                }
            });
        }
    } catch (err) {
        console.error('[Completion Invoice] Stripe link creation failed:', err);
    }

    // Generate PDF with full invoice detail
    let pdfBuffer: Buffer | null = null;
    try {
        const fullInvoice = await db.invoice.findUnique({
            where: { id: invoice.id },
            include: {
                quote: { include: { items: true } },
                customer: true,
                overageItems: true,
            }
        });

        if (fullInvoice) {
            pdfBuffer = await generateInvoicePDF({
                ...fullInvoice,
                paymentLink: completionPaymentLink,
            });
        }
    } catch (err) {
        console.error('[Completion Invoice] PDF generation failed:', err);
    }

    // Send email to customer
    const overageSection = overageItems.length > 0 ? `
        <div style="margin: 16px 0;">
            <p style="font-weight: 700; color: #0f172a; margin-bottom: 8px;">Additional Charges:</p>
            <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="text-align: left; padding: 8px;">Description</th>
                        <th style="text-align: right; padding: 8px;">Qty</th>
                        <th style="text-align: right; padding: 8px;">Price</th>
                        <th style="text-align: right; padding: 8px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${overageItems.map(item => `
                        <tr style="border-bottom: 1px solid #f1f5f9;">
                            <td style="padding: 8px;">${item.description}</td>
                            <td style="text-align: right; padding: 8px;">${item.quantity}</td>
                            <td style="text-align: right; padding: 8px;">$${Number(item.unitPrice).toFixed(2)}</td>
                            <td style="text-align: right; padding: 8px; font-weight: 600;">$${(item.quantity * item.unitPrice).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    ` : '';

    await sendEmail({
        to: customer.email,
        subject: `Your Project is Complete — Final Invoice #${invoice.number}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0f172a;">Your Project is Complete!</h2>
                <p>Hi ${customer.name},</p>
                <p>Great news — your Pioneer Concrete Coatings project has been completed. Please find your final invoice below.</p>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
                    <p style="margin: 0 0 4px;"><strong>Invoice #:</strong> ${invoice.number}</p>
                    <p style="margin: 0 0 4px;"><strong>Original Balance:</strong> $${balance.toFixed(2)}</p>
                    ${overageTotal > 0 ? `<p style="margin: 0 0 4px;"><strong>Additional Charges:</strong> $${overageTotal.toFixed(2)}</p>` : ''}
                    <p style="margin: 8px 0 0; font-size: 16px; font-weight: 700; color: #0f172a;"><strong>Total Due: $${finalAmount.toFixed(2)}</strong></p>
                </div>

                ${overageSection}

                ${completionPaymentLink ? `
                <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                    <p style="color: #166534; font-weight: 700; font-size: 16px; margin: 0 0 12px;">Pay Your Final Balance</p>
                    <a href="${completionPaymentLink}"
                       style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 700;">
                        Pay $${finalAmount.toFixed(2)} Securely
                    </a>
                </div>
                ` : `
                <p style="color: #475569;">Your invoice is attached to this email. Please contact us to arrange payment.</p>
                `}

                <p>Thank you for choosing Pioneer Concrete Coatings. We appreciate your business!</p>
                <p>— Pioneer Concrete Coatings Team</p>
            </div>
        `,
        attachments: pdfBuffer ? [{
            filename: `Invoice-${invoice.number}.pdf`,
            content: pdfBuffer,
        }] : [],
    });

    console.log(`[Completion Invoice] Sent to ${customer.email} for job ${jobId}, amount $${finalAmount}`);
}
