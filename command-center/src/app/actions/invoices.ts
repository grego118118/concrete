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

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF(invoice);

    // Send Email via Nodemailer
    await sendEmail({
        to: invoice.customer.email,
        subject: `Invoice #${invoice.number} from Pioneer Concrete`,
        html: `
            <h1>Your Invoice</h1>
            <p>Hi ${invoice.customer.name},</p>
            <p>Please find your invoice attached.</p>
            <p>Amount Due: $${Number(invoice.amount).toFixed(2)}</p>
            ${invoice.dueDate ? `<p>Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</p>` : ''}
            <br/>
            <p>Thank you for your business!</p>
            <p>Pioneer Concrete Coatings</p>
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
