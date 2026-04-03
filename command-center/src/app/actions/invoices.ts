'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createInvoice(formData: FormData) {
    const customerId = formData.get("customerId") as string
    const amount = formData.get("amount") as string
    const dueDate = formData.get("dueDate") as string

    // Generate unique invoice number
    const number = `INV-${Date.now()}`

    await db.invoice.create({
        data: {
            number,
            status: "PENDING",
            amount: parseFloat(amount),
            dueDate: dueDate ? new Date(dueDate) : null,
            customer: {
                connect: { id: customerId }
            },
            // Note: In a real app, we might link to a quote here, but for manual creation we make it optional in schema or handle differently.
            // Schema has `quoteId String @unique`, which makes it required 1:1. 
            // Wait, if quoteId is required, we can't create standalone invoices easily without changing schema.
            // Let's check schema.
            quote: {
                create: {
                    number: `Q-AUTO-${Date.now()}`,
                    status: "APPROVED",
                    subtotal: parseFloat(amount),
                    tax: 0,
                    total: parseFloat(amount),
                    customer: { connect: { id: customerId } }
                }
            }
        }
    })

    revalidatePath("/app/crm/invoices")
    redirect("/app/crm/invoices")
}

export async function getInvoices() {
    return await db.invoice.findMany({
        include: {
            customer: true,
            quote: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export async function getInvoice(id: string) {
    return await db.invoice.findUnique({
        where: { id },
        include: {
            customer: true,
            quote: true
        }
    })
}

export async function updateInvoice(id: string, formData: FormData) {
    const status = formData.get("status") as string

    await db.invoice.update({
        where: { id },
        data: {
            status: status as any
        }
    })

    revalidatePath("/app/crm/invoices")
    redirect("/app/crm/invoices")
}

export async function deleteInvoice(id: string) {
    await db.invoice.delete({
        where: { id }
    })

    revalidatePath("/app/crm/invoices")
}

import { sendEmail } from "@/lib/mailer";

export async function sendInvoice(id: string) {
    const invoice = await db.invoice.findUnique({
        where: { id },
        include: {
            customer: true,
            quote: {
                include: { items: true }
            },
        }
    }) as any;

    if (!invoice || !invoice.customer) throw new Error("Invoice or customer not found");

    // Capture existing Stripe payment links before QB sync potentially modifies the row
    const beforeSync = await db.invoice.findUnique({ where: { id } }) as any;
    const stripeLink = beforeSync?.completionPaymentLink || beforeSync?.paymentLink;

    // Sync to QuickBooks (non-critical)
    try {
        const { createQBInvoice } = await import("@/lib/quickbooks/invoice-sync");
        await createQBInvoice(invoice.quoteId);
    } catch (err) {
        console.warn('[sendInvoice] QB sync failed (non-critical):', err);
    }

    // Refresh to pick up any payment link from QB sync; fall back to original Stripe link
    const fresh = await db.invoice.findUnique({ where: { id } }) as any;
    const paymentLink = fresh?.completionPaymentLink || fresh?.paymentLink || stripeLink;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://pioneerconcretecoatings.com';
    const invoiceUrl = `${baseUrl}/invoice/${id}`;
    const trackingPixelUrl = `${baseUrl}/app/api/track/invoice/${id}`;
    const amount = Number(invoice.amount);

    // Generate PDF — non-fatal, email sends with or without it
    let pdfBuffer: Buffer | null = null;
    try {
        const { generateInvoicePDF } = await import("@/lib/pdf-generator");
        pdfBuffer = await generateInvoicePDF({ ...invoice, paymentLink });
    } catch (err) {
        console.warn('[sendInvoice] PDF generation failed (non-critical):', err);
    }

    await sendEmail({
        to: invoice.customer.email,
        subject: `Invoice #${invoice.number} from Pioneer Concrete Coatings`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0f172a;">
                <h2 style="color: #0f172a;">Your Invoice is Ready</h2>
                <p>Hi ${invoice.customer.name},</p>
                <p>Please find your invoice from Pioneer Concrete Coatings below.</p>

                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                    <p style="color: #64748b; margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 0.05em;">Invoice #${invoice.number}</p>
                    <p style="color: #0f172a; font-size: 32px; font-weight: 800; margin: 0;">$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    ${invoice.dueDate ? `<p style="color: #ef4444; margin: 8px 0 0; font-size: 14px; font-weight: 600;">Due by ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
                </div>

                <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                    <p style="color: #166534; font-weight: 700; font-size: 16px; margin: 0 0 12px;">View &amp; Pay Your Invoice</p>
                    <a href="${invoiceUrl}"
                       style="display: inline-block; background: #22c55e; color: white; text-decoration: none; padding: 14px 32px; border-radius: 10px; font-size: 16px; font-weight: 700;">
                        View Invoice &amp; Pay $${amount.toFixed(2)}
                    </a>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 12px;">Secured by Stripe · All major cards accepted</p>
                </div>

                <p style="color: #475569; line-height: 1.6;">If you have any questions, please reply to this email or call us at <strong>(413) 544-4933</strong>.</p>
                <p>Thank you,<br/>Pioneer Concrete Coatings</p>
                <img src="${trackingPixelUrl}" width="1" height="1" style="display:block;border:0;margin:0;padding:0;" alt="" />
            </div>
        `,
        attachments: pdfBuffer ? [{ filename: `Invoice-${invoice.number}.pdf`, content: pdfBuffer }] : [],
    });

    await db.invoice.update({
        where: { id },
        data: { status: 'SENT', sentAt: new Date() }
    });

    revalidatePath("/app/crm/invoices");
    revalidatePath(`/app/crm/invoices/${id}/edit`);
}

export async function syncQBInvoice(id: string) {
    const invoice = await db.invoice.findUnique({
        where: { id },
        include: { quote: true }
    });

    if (!invoice) throw new Error("Invoice not found");

    try {
        const { createQBInvoice } = await import("@/lib/quickbooks/invoice-sync");
        await createQBInvoice(invoice.quoteId);
        
        revalidatePath("/app/crm/invoices");
        revalidatePath(`/app/crm/invoices/${id}`);
        return { success: true };
    } catch (err: any) {
        console.error('[syncQBInvoice] Manual sync failed:', err);
        return { success: false, error: err.message };
    }
}
