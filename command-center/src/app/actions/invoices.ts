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
import { generateInvoicePDF } from "@/lib/pdf-generator";

export async function sendInvoice(id: string) {
    const invoice = await db.invoice.findUnique({
        where: { id },
        include: {
            customer: true,
            quote: {
                include: { items: true }
            }
        }
    });

    if (!invoice || !invoice.customer) throw new Error("Invoice or customer not found");

    // Sync to QuickBooks first to ensure we have a payment link
    try {
        const { createQBInvoice } = await import("@/lib/quickbooks/invoice-sync");
        await createQBInvoice(invoice.quoteId);
    } catch (err) {
        console.warn('[sendInvoice] QB sync failed:', err);
    }

    // Refresh invoice data to get the link
    const updatedInvoice = await db.invoice.findUnique({
        where: { id },
    });
    const paymentLink = updatedInvoice?.paymentLink;

    // Generate PDF
    const { generateInvoicePDF } = await import("@/lib/pdf-generator");
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Send Email via Nodemailer
    await sendEmail({
        to: invoice.customer.email,
        subject: `Invoice #${invoice.number} from Pioneer Concrete Coatings`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <h2 style="color: #0f172a;">Your Invoice is Ready</h2>
                <p>Hi ${invoice.customer.name},</p>
                <p>Thank you for choosing Pioneer Concrete Coatings. Please find your invoice #${invoice.number} attached as a PDF.</p>
                
                <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                    <p style="color: #64748b; margin: 0 0 5px; font-size: 12px; text-transform: uppercase;">Amount Due</p>
                    <p style="color: #0f172a; font-size: 32px; font-weight: 800; margin: 0;">$${Number(invoice.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                    ${invoice.dueDate ? `<p style="color: #ef4444; margin: 8px 0 0; font-size: 14px; font-weight: 600;">Due by ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
                </div>

                ${paymentLink ? `
                <div style="text-align: center; margin: 30px 0;">
                    <a href="${paymentLink}" 
                       style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 16px 40px; border-radius: 10px; font-size: 16px; font-weight: 700; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                        Pay Securely via QuickBooks
                    </a>
                    <p style="color: #94a3b8; font-size: 12px; margin-top: 12px;">Secure credit card or ACH payment</p>
                </div>
                ` : ''}

                <p style="color: #475569; line-height: 1.6;">If you have any questions, please feel free to reply to this email or call us at (413) 544-4933.</p>
                <br/>
                <p>Thank you,<br/>Pioneer Concrete Coatings</p>
            </div>
        `,
        attachments: [
            {
                filename: `Invoice-${invoice.number}.pdf`,
                content: pdfBuffer,
            }
        ]
    });

    await db.invoice.update({
        where: { id },
        data: {
            status: 'SENT'
        }
    })

    revalidatePath("/app/crm/invoices")
    revalidatePath(`/app/crm/invoices/${id}`)
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
