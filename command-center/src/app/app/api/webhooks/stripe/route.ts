import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';
import { sendEmail } from '@/lib/mailer';

export async function POST(request: NextRequest) {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
        return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
        console.error('[Stripe Webhook] Signature verification failed:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle payment completion from a Payment Link
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;

        const invoiceId = session.metadata?.invoiceId;
        const quoteId = session.metadata?.quoteId;

        if (!invoiceId) {
            console.warn('[Stripe Webhook] No invoiceId in session metadata, skipping');
            return NextResponse.json({ received: true });
        }

        const amountPaid = (session.amount_total ?? 0) / 100; // convert cents to dollars

        try {
            const invoice = await db.invoice.findUnique({
                where: { id: invoiceId },
                include: { quote: true, customer: true },
            });

            if (!invoice) {
                console.error('[Stripe Webhook] Invoice not found:', invoiceId);
                return NextResponse.json({ received: true });
            }

            const invoiceTotal = Number(invoice.amount);
            const isFullPayment = amountPaid >= invoiceTotal;
            const newStatus = isFullPayment ? 'PAID' : 'DEPOSIT_PAID';

            await db.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: newStatus as any,
                    paidAt: new Date(),
                    paymentMethod: session.payment_method_types?.[0] ?? 'card',
                    paymentReference: session.payment_intent as string ?? session.id,
                },
            });

            console.log(`[Stripe Webhook] Invoice ${invoiceId} marked as ${newStatus} ($${amountPaid})`);

            // Send internal notification email to admin
            const adminEmail = process.env.SMTP_USER || 'admin@pioneerconcretecoatings.com';
            const customerName = invoice.customer?.name ?? 'Unknown Customer';
            const paymentLabel = isFullPayment ? 'Full Payment' : '50% Deposit';
            try {
                await sendEmail({
                    to: adminEmail,
                    subject: `💰 Payment Received — ${customerName} ($${amountPaid.toFixed(2)})`,
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                            <h2 style="color: #16a34a;">Payment Received</h2>
                            <p>A payment has been processed via Stripe.</p>
                            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                                <tr style="background: #f8fafc;">
                                    <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e2e8f0;">Customer</td>
                                    <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${customerName}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e2e8f0;">Invoice</td>
                                    <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${invoice.number}</td>
                                </tr>
                                <tr style="background: #f8fafc;">
                                    <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e2e8f0;">Amount Paid</td>
                                    <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: bold;">$${amountPaid.toFixed(2)}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e2e8f0;">Type</td>
                                    <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${paymentLabel}</td>
                                </tr>
                                <tr style="background: #f8fafc;">
                                    <td style="padding: 10px 14px; font-weight: bold; border: 1px solid #e2e8f0;">Stripe Session</td>
                                    <td style="padding: 10px 14px; border: 1px solid #e2e8f0; font-size: 12px; color: #64748b;">${session.id}</td>
                                </tr>
                            </table>
                            <a href="https://pioneerconcretecoatings.com/app/crm/invoices"
                               style="display: inline-block; background: #2563eb; color: white; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 700;">
                                View in CRM
                            </a>
                            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">Pioneer Concrete Coatings Command Center</p>
                        </div>
                    `,
                });
                console.log(`[Stripe Webhook] Admin notification sent for invoice ${invoice.number}`);
            } catch (emailErr) {
                console.warn('[Stripe Webhook] Admin notification email failed (non-critical):', emailErr);
            }

            // Send receipt email to customer
            if (invoice.customer?.email) {
                const balanceDue = isFullPayment ? 0 : Number(invoice.amount) - amountPaid;
                try {
                    await sendEmail({
                        to: invoice.customer.email,
                        subject: `Payment Receipt — Pioneer Concrete Coatings`,
                        html: `
                            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #0f172a;">
                                <div style="text-align: center; padding: 30px 0 20px;">
                                    <h1 style="font-size: 28px; font-weight: 800; margin: 0; color: #0f172a;">Pioneer Concrete Coatings</h1>
                                    <p style="color: #64748b; margin: 6px 0 0;">Payment Receipt</p>
                                </div>

                                <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center;">
                                    <p style="color: #16a34a; font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 8px;">✓ Payment Confirmed</p>
                                    <p style="font-size: 42px; font-weight: 800; margin: 0; color: #0f172a;">$${amountPaid.toFixed(2)}</p>
                                    <p style="color: #64748b; margin: 8px 0 0; font-size: 14px;">${paymentLabel} — Invoice #${invoice.number}</p>
                                </div>

                                <p style="font-size: 16px; line-height: 1.6;">Hi ${customerName},</p>
                                <p style="font-size: 16px; line-height: 1.6; color: #475569;">
                                    Thank you — your ${isFullPayment ? 'payment' : 'deposit'} has been received and confirmed.
                                    ${isFullPayment
                                        ? 'Your account is paid in full.'
                                        : `The remaining balance of <strong>$${balanceDue.toFixed(2)}</strong> will be due upon completion of the project.`
                                    }
                                </p>

                                <table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px;">
                                    <tr style="background: #f8fafc;">
                                        <td style="padding: 10px 14px; font-weight: 600; border: 1px solid #e2e8f0; color: #475569;">Invoice #</td>
                                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${invoice.number}</td>
                                    </tr>
                                    <tr>
                                        <td style="padding: 10px 14px; font-weight: 600; border: 1px solid #e2e8f0; color: #475569;">Amount Paid</td>
                                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; color: #16a34a; font-weight: 700;">$${amountPaid.toFixed(2)}</td>
                                    </tr>
                                    ${!isFullPayment ? `
                                    <tr style="background: #f8fafc;">
                                        <td style="padding: 10px 14px; font-weight: 600; border: 1px solid #e2e8f0; color: #475569;">Balance Due</td>
                                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">$${balanceDue.toFixed(2)}</td>
                                    </tr>` : ''}
                                    <tr ${!isFullPayment ? '' : 'style="background: #f8fafc;"'}>
                                        <td style="padding: 10px 14px; font-weight: 600; border: 1px solid #e2e8f0; color: #475569;">Payment Method</td>
                                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0; text-transform: capitalize;">${session.payment_method_types?.[0] ?? 'Card'}</td>
                                    </tr>
                                    <tr ${!isFullPayment ? 'style="background: #f8fafc;"' : ''}>
                                        <td style="padding: 10px 14px; font-weight: 600; border: 1px solid #e2e8f0; color: #475569;">Date</td>
                                        <td style="padding: 10px 14px; border: 1px solid #e2e8f0;">${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</td>
                                    </tr>
                                </table>

                                <p style="font-size: 14px; color: #475569; line-height: 1.6;">
                                    If you have any questions, reply to this email or call us at <strong>(413) 544-4933</strong>.
                                </p>
                                <p style="font-size: 14px; color: #475569;">Thank you for choosing Pioneer Concrete Coatings!</p>

                                <div style="border-top: 1px solid #e2e8f0; margin-top: 32px; padding-top: 16px; text-align: center;">
                                    <p style="color: #94a3b8; font-size: 12px; margin: 0;">Pioneer Concrete Coatings · (413) 544-4933 · admin@pioneerconcretecoatings.com</p>
                                </div>
                            </div>
                        `,
                    });
                    console.log(`[Stripe Webhook] Customer receipt sent to ${invoice.customer.email}`);
                } catch (emailErr) {
                    console.warn('[Stripe Webhook] Customer receipt email failed (non-critical):', emailErr);
                }
            }

            // Record payment in QuickBooks if connected
            if (invoice.qbInvoiceId && quoteId) {
                try {
                    const { recordStripePaymentInQB } = await import('@/lib/quickbooks/invoice-sync');
                    await recordStripePaymentInQB(quoteId, amountPaid, session.id);
                } catch (err) {
                    console.warn('[Stripe Webhook] QB payment recording failed (non-critical):', err);
                }
            }
        } catch (err) {
            console.error('[Stripe Webhook] Failed to update invoice:', err);
        }
    }

    return NextResponse.json({ received: true });
}
