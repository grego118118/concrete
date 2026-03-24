import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // QuickBooks sends a verification challenge on webhook setup
        if (body.challengeToken) {
            return NextResponse.json({ challengeToken: body.challengeToken });
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
 * Handle a deleted payment in QuickBooks (refund/void)
 */
async function handlePaymentDeleted(qbPaymentId: string) {
    try {
        // Find and revert any invoices that were paid by this payment
        const invoice = await db.invoice.findFirst({
            where: { paymentReference: qbPaymentId },
        });

        if (invoice) {
            await db.invoice.update({
                where: { id: invoice.id },
                data: {
                    status: 'PENDING',
                    paidAt: null,
                    paymentReference: null,
                    paymentMethod: null,
                },
            });

            console.log(`[QB Webhook] Invoice ${invoice.number} reverted to PENDING (payment deleted)`);
        }
    } catch (error) {
        console.error('[QB Webhook] handlePaymentDeleted error:', error);
    }
}

// QuickBooks also sends GET for webhook verification
export async function GET() {
    return NextResponse.json({ status: 'QuickBooks webhook endpoint active' });
}
