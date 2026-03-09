
import { db } from "@/lib/db";
import { generateQuotePDF } from "@/lib/pdf-generator";
import { sendEmail } from "@/lib/mailer";

export async function processSendQuote(quoteId: string, logId: string) {
    console.log(`[Background] Processing Quote Send: ${quoteId}`);
    try {
        // 1. Fetch Quote
        const quote = await db.quote.findUnique({
            where: { id: quoteId },
            include: { customer: true, items: true }
        });

        if (!quote || !quote.customer) throw new Error("Quote or customer not found");

        // 2. Generate PDF
        const pdfBuffer = await generateQuotePDF(quote);

        // 3. Send Email
        const origin = process.env.NEXTAUTH_URL || "http://localhost:3000";
        const acceptUrl = `${origin}/quote/${quote.id}`;
        const displayTotal = Number(quote.total);

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

                        <div style="text-align: center; margin: 32px 0;">
                            <a href="${acceptUrl}" 
                               style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 18px; font-weight: 700; letter-spacing: -0.3px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.3);">
                                ✓ Review &amp; Accept Quote
                            </a>
                        </div>
                         <p style="color: #94a3b8; font-size: 12px; text-align: center; margin-top: 20px;">
                            This quote is valid for 30 days.<br/>
                            Questions? Call us at <strong>(413) 544-4933</strong>.
                        </p>
                         <p style="color: #cbd5e1; font-size: 11px; text-align: center; margin-top: 16px;">
                            Link: <a href="${acceptUrl}" style="color: #93c5fd;">${acceptUrl}</a>
                        </p>
                    </div>
                </div>
            `,
            attachments: [{ filename: `Quote-${quote.number}.pdf`, content: pdfBuffer }]
        });

        // 4. Update Quote Status
        await db.quote.update({
            where: { id: quote.id },
            data: { status: 'SENT' }
        });

        // 5. Update Sync Log Success
        await db.syncLog.update({
            where: { id: logId },
            data: { status: 'COMPLETED', completedAt: new Date() }
        });
        console.log(`[Background] Quote Send Completed`);

    } catch (err: any) {
        console.error(`[Background] Quote Send Failed:`, err);
        // Update Sync Log Failure
        await db.syncLog.update({
            where: { id: logId },
            data: { status: 'FAILED', errorMessage: err.message, completedAt: new Date() }
        });
    }
}
