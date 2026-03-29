import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/lib/db';

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
                include: { quote: true },
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
