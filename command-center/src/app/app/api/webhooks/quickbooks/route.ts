import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

/**
 * POST /app/api/webhooks/quickbooks
 *
 * Receives webhook notifications from QuickBooks Online.
 * Handles payment creation/update events to sync payment status back to CRM.
 *
 * QuickBooks webhook payload structure:
 * {
 *   "eventNotifications": [{
 *     "realmId": "...",
 *     "dataChangeEvent": {
 *       "entities": [{
 *         "name": "Payment",
 *         "id": "123",
 *         "operation": "Create",
 *         "lastUpdated": "2026-03-23T00:00:00.000Z"
 *       }]
 *     }
 *   }]
 * }
 */

function verifyQBSignature(rawBody: string, signature: string | null): boolean {
    const verifierToken = process.env.QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN;
    if (!verifierToken) {
        console.error('[QB Webhook] QUICKBOOKS_WEBHOOK_VERIFIER_TOKEN is not set');
        return false;
    }
    if (!signature) return false;
    const expected = crypto.createHmac('sha256', verifierToken).update(rawBody).digest('base64');
    try {
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
    } catch {
        return false;
    }
}

export async function POST(request: NextRequest) {
    try {
        const rawBody = await request.text();
        const signature = request.headers.get('intuit-signature');

        // QuickBooks sends a verification challenge on webhook setup (no signature)
        let body: any;
        try {
            body = JSON.parse(rawBody);
        } catch {
            return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
        }

        if (body.challengeToken) {
            return NextResponse.json({ challengeToken: body.challengeToken });
        }

        // All real event payloads must have a valid signature
        if (!verifyQBSignature(rawBody, signature)) {
            console.error('[QB Webhook] Signature verification failed');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const notifications = body.eventNotifications || [];

        for (const notification of notifications) {
            const entities = notification.dataChangeEvent?.entities || [];

            for (const entity of entities) {
                if (entity.name === 'Payment' && entity.operation === 'Create') {
                    await handlePaymentCreated(entity.id, notification.realmId);
                } else if (entity.name === 'Payment' && entity.operation === 'Delete') {
                    await handlePaymentDeleted(entity.id);
                }
            }
        }

        return NextResponse.json({ status: 'ok' });
    } catch (error: any) {
        console.error('[QB Webhook] Error:', error);
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}

/**
 * Handle a new payment in QuickBooks
 */
async function handlePaymentCreated(qbPaymentId: string, realmId: string) {
    try {
        // Get the QB connection for this realm
        const connection = await db.quickBooksConnection.findUnique({
            where: { realmId },
        });

        if (!connection || !connection.isActive) {
            console.warn('[QB Webhook] No active connection for realm:', realmId);
            return;
        }

        // Fetch payment details from QuickBooks
        const { qbApiRequest } = await import('@/lib/quickbooks/client');
        const paymentData = await qbApiRequest(
            'GET',
            `payment/${qbPaymentId}`,
            realmId,
            connection.accessToken
        );

        const payment = paymentData?.Payment;
        if (!payment) return;

        // Find the linked invoice(s) in our system
        const linkedInvoices = payment.Line || [];
        for (const line of linkedInvoices) {
            if (line.LinkedTxn) {
                for (const txn of line.LinkedTxn) {
                    if (txn.TxnType === 'Invoice') {
                        const qbInvoiceId = txn.TxnId;

                        // Find our invoice by QB invoice ID
                        const invoice = await db.invoice.findFirst({
                            where: { qbInvoiceId },
                            include: { quote: true },
                        });

                        if (invoice) {
                            const paymentAmount = Number(payment.TotalAmt || line.Amount || 0);
                            const invoiceAmount = Number(invoice.amount);
                            const depositAmount = invoice.quote ? Number(invoice.quote.deposit) : invoiceAmount * 0.5;

                            // Determine status based on payment amount
                            let newStatus: string;
                            if (paymentAmount >= invoiceAmount) {
                                newStatus = 'PAID';
                            } else if (paymentAmount >= depositAmount) {
                                newStatus = 'DEPOSIT_PAID';
                            } else {
                                newStatus = 'DEPOSIT_PAID'; // Any partial payment counts as deposit
                            }

                            await db.invoice.update({
                                where: { id: invoice.id },
                                data: {
                                    status: newStatus as any,
                                    paidAt: newStatus === 'PAID' ? new Date() : undefined,
                                    paymentMethod: payment.PaymentMethodRef?.name || 'unknown',
                                    paymentReference: qbPaymentId,
                                },
                            });

                            console.log(`[QB Webhook] Invoice ${invoice.number} updated to ${newStatus}`);
                        }
                    }
                }
            }
        }
    } catch (error) {
        console.error('[QB Webhook] handlePaymentCreated error:', error);
    }
}

/**
 * Handle a deleted payment in QuickBooks.
 * QB is used for accounting only — Stripe is the authoritative payment source.
 * We log the deletion but do NOT revert CRM invoice status, since the Stripe
 * payment may still be valid (e.g. a bookkeeper correcting a duplicate QB entry).
 */
async function handlePaymentDeleted(qbPaymentId: string) {
    try {
        const invoice = await db.invoice.findFirst({
            where: { paymentReference: qbPaymentId },
        });

        if (invoice) {
            console.warn(`[QB Webhook] QB payment ${qbPaymentId} deleted — Invoice ${invoice.number} status unchanged (QB is accounting-only)`);
        }
    } catch (error) {
        console.error('[QB Webhook] handlePaymentDeleted error:', error);
    }
}

// QuickBooks also sends GET for webhook verification
export async function GET() {
    return NextResponse.json({ status: 'QuickBooks webhook endpoint active' });
}
