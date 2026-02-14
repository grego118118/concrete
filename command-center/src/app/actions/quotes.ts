'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export type QuoteItem = {
    description: string
    qty: number
    unit?: string
    price: number
}

export type CreateQuoteData = {
    customerId: string
    items: QuoteItem[]
    status?: string
    scopeArea?: number
    baseRate?: number
    scopeData?: any
    cleanupFee?: number
    notes?: string
}

export async function createQuote(data: CreateQuoteData) {
    const { customerId, items, status = "DRAFT", scopeArea, baseRate, scopeData, cleanupFee, notes } = data

    // Calculate financials from scope data if available, otherwise from items
    let subtotal: number;
    const taxRate = 0.0625;

    if (scopeArea && baseRate) {
        // Calculate from scope calculator data
        const baseCost = scopeArea * baseRate;
        const customItems = (scopeData?.customItems || []) as Array<{ sqft: number; rate: number }>;
        const customItemsTotal = customItems.reduce((sum: number, item: any) => sum + (item.sqft * item.rate), 0);
        subtotal = baseCost + customItemsTotal;
    } else {
        // Fallback to line items calculation
        subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);
    }

    // Add cleanup fee to subtotal if present
    if (cleanupFee) {
        subtotal += cleanupFee;
    }

    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const deposit = total * 0.5;
    const balance = total - deposit;

    // Generate unique quote number
    const number = `Q-${Date.now()}`

    const quote = await db.quote.create({
        data: {
            number,
            customerId,
            status: status as any,
            subtotal,
            tax,
            total,
            deposit,
            balance,
            scopeArea: scopeArea || null,
            scopeData: scopeData || null,
            cleanupFee: cleanupFee || null,
            notes: notes || null,
            items: {
                create: items.map(item => ({
                    description: item.description,
                    quantity: item.qty,
                    unit: item.unit || "ea",
                    unitPrice: item.price,
                    total: item.qty * item.price
                }))
            }
        }
    })

    revalidatePath("/crm/quotes")
    redirect(`/crm/quotes/${quote.id}`)
}

export async function getQuotes() {
    return await db.quote.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            customer: true,
        }
    })
}

export async function getQuote(id: string) {
    return await db.quote.findUnique({
        where: { id },
        include: {
            customer: true,
            items: true
        }
    })
}

export async function updateQuoteDetails(id: string, data: CreateQuoteData) {
    const { customerId, items, status, cleanupFee, notes } = data

    // Calculate financials
    let subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0)

    // Add cleanup fee to subtotal if present
    if (cleanupFee) {
        subtotal += cleanupFee;
    }

    const taxRate = 0.0625 // Example MA tax rate
    const tax = subtotal * taxRate
    const total = subtotal + tax

    // Update quote and replace items transactionally
    await db.$transaction(async (tx) => {
        // 1. Delete existing items
        await tx.quoteItem.deleteMany({
            where: { quoteId: id }
        })

        // 2. Update quote details and recreate items
        await tx.quote.update({
            where: { id },
            data: {
                customerId,
                status: status as any,
                subtotal,
                tax,
                total,
                cleanupFee: cleanupFee || null,
                notes: notes || null,
                items: {
                    create: items.map(item => ({
                        description: item.description,
                        quantity: item.qty,
                        unit: item.unit || "ea",
                        unitPrice: item.price,
                        total: item.qty * item.price
                    }))
                }
            }
        })
    })

    revalidatePath("/crm/quotes")
    revalidatePath(`/crm/quotes/${id}`)
    redirect("/crm/quotes")
}

export async function deleteQuote(id: string) {
    // Disconnect related Job (nullify quoteId) to avoid FK constraint
    await db.job.updateMany({
        where: { quoteId: id },
        data: { quoteId: null }
    });

    // Delete any related invoices
    await db.invoice.deleteMany({
        where: { quoteId: id }
    });

    // Now delete the quote (items + photos cascade automatically)
    await db.quote.delete({
        where: { id }
    });

    revalidatePath("/app/crm/quotes");
    redirect("/app/crm/quotes");
}

import { sendEmail } from "@/lib/mailer";
import { generateQuotePDF } from "@/lib/pdf-generator";

export async function sendQuote(id: string) {
    console.log(`[sendQuote] Starting for ID: ${id}`);
    const quote = await db.quote.findUnique({
        where: { id },
        include: { customer: true, items: true }
    });
    console.log(`[sendQuote] Quote found: ${quote?.number}`);

    if (!quote || !quote.customer) throw new Error("Quote or customer not found");

    // Calculate display total from scope data if available
    const scopeData = quote.scopeData as any;
    const scopeArea = Number(quote.scopeArea) || 0;
    const baseRate = Number(scopeData?.baseRate) || (scopeArea > 0 ? Number(quote.total) / scopeArea : 0);
    const customItems = (scopeData?.customItems || []) as Array<{ sqft: number; rate: number }>;
    const baseCost = scopeArea * baseRate;
    const customTotal = customItems.reduce((sum: number, item: any) => sum + (item.sqft * item.rate), 0);
    const subtotal = baseCost + customTotal;
    const displayTotal = subtotal > 0 ? subtotal + (subtotal * 0.0625) : Number(quote.total);

    // Generate PDF
    console.log(`[sendQuote] Generating PDF...`);
    const pdfBuffer = await generateQuotePDF(quote);
    console.log(`[sendQuote] PDF generated, size: ${pdfBuffer.length} bytes`);

    // Build the public acceptance URL
    const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const acceptUrl = `${origin}/quote/${quote.id}`;

    // Send Email via Nodemailer
    console.log(`[sendQuote] Attempting to send email to: ${quote.customer.email}`);
    try {
        await sendEmail({
            to: quote.customer.email,
            subject: `Your Quote #${quote.number} from Pioneer Concrete Coatings`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                    <div style="background: #0f172a; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 900; letter-spacing: -0.5px;">Pioneer Concrete Coatings</h1>
                        <p style="color: #94a3b8; margin: 5px 0 0; font-size: 13px;">Professional Epoxy Floor Coating Systems</p>
                    </div>
                    <div style="background: #f8fafc; padding: 30px; border: 1px solid #e2e8f0;">
                        <p style="font-size: 16px; color: #334155;">Hi ${quote.customer.name},</p>
                        <p style="color: #475569; line-height: 1.6;">Thank you for your interest! Please find your quote attached as a PDF. You can also review and accept it online using the button below.</p>
                        
                        <div style="background: white; border: 2px solid #e2e8f0; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                            <p style="color: #64748b; margin: 0 0 5px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Quote Total</p>
                            <p style="color: #0f172a; font-size: 36px; font-weight: 900; margin: 0;">$${displayTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            <p style="color: #64748b; margin: 5px 0 0; font-size: 12px;">Quote #${quote.number}</p>
                        </div>

                        <!-- Accept Quote CTA Button -->
                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${acceptUrl}" 
                               style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 18px; font-weight: 700; letter-spacing: -0.3px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
                                ✓ Review &amp; Accept Quote
                            </a>
                        </div>

                        <div style="background: #f0fdf4; border: 2px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0;">
                            <p style="color: #15803d; font-weight: 700; font-size: 15px; margin: 0 0 8px;">Accept online in 2 easy steps:</p>
                            <p style="color: #166534; margin: 0; font-size: 14px; line-height: 1.8;">
                                <strong>1.</strong> Click the button above to review your quote<br/>
                                <strong>2.</strong> Accept &amp; pay the 50% deposit to lock in your date
                            </p>
                        </div>

                        <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                            This quote is valid for 30 days. A 50% deposit is required to confirm your booking.<br/>
                            Questions? Call us at <strong>(413) 544-4933</strong> or reply to this email.
                        </p>

                        <!-- Fallback text link -->
                        <p style="color: #cbd5e1; font-size: 11px; text-align: center; margin-top: 16px;">
                            Button not working? Copy this link: <a href="${acceptUrl}" style="color: #93c5fd;">${acceptUrl}</a>
                        </p>
                    </div>
                    <div style="text-align: center; padding: 15px; color: #94a3b8; font-size: 11px;">
                        <p>Pioneer Concrete Coatings • Serving Southern New England • (413) 544-4933</p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: `Quote-${quote.number}.pdf`,
                    content: pdfBuffer,
                }
            ]
        });
        console.log(`[sendQuote] Email sent successfully`);
    } catch (sendError: any) {
        console.error(`[sendQuote] Email sending failed:`, sendError);
        throw sendError;
    }

    await db.quote.update({
        where: { id },
        data: {
            status: 'SENT'
        }
    })

    revalidatePath("/crm/quotes")
    revalidatePath(`/crm/quotes/${id}`)
}
