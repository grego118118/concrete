'use server';

/**
 * QuickBooks Invoice Sync
 * 
 * Creates QuickBooks invoices from accepted CRM quotes.
 * Maps line items, discount, tax, and deposit.
 */

import { db } from '@/lib/db';
import { getQBConnection } from './connection';
import { syncCustomerToQB } from './customer-sync';
import { qbApiRequest } from './client';

/**
 * Create a QuickBooks invoice from an accepted quote with multi-tier fallback
 */
export async function createQBInvoice(quoteId: string): Promise<string | null> {
    const quote = await db.quote.findUnique({
        where: { id: quoteId },
        include: {
            customer: true,
            items: true,
            invoice: true,
        },
    });

    if (!quote) {
        console.error('[QB Invoice Sync] Quote not found:', quoteId);
        return null;
    }

    const businessId = quote.customer.businessId;

    const connection = await getQBConnection(businessId);
    if (!connection) {
        console.log(`[QB Invoice Sync] No active QB connection for business ${businessId}, skipping`);
        return null;
    }

    if (quote.invoice?.qbInvoiceId) {
        console.log(`[QB Invoice Sync] Invoice already synced (QB ID: ${quote.invoice.qbInvoiceId})`);
        return quote.invoice.qbInvoiceId;
    }

    let qbCustomerId = quote.customer.qbCustomerId;
    if (!qbCustomerId) {
        qbCustomerId = await syncCustomerToQB(quote.customer.id);
        if (!qbCustomerId) {
            console.error('[QB Invoice Sync] Could not sync customer to QB');
            return null;
        }
    }

    try {
        console.log(`[QB Invoice Sync] Preparing line items for Quote ${quote.number}`);
        
        const lines = quote.items.map((item, index) => {
            const amount = Number(item.total);
            const qty = Number(item.quantity) || 1;
            const unitPrice = Number(item.unitPrice) || amount;

            return {
                DetailType: 'SalesItemLineDetail',
                Amount: amount,
                Description: item.description || quote.number,
                SalesItemLineDetail: {
                    Qty: qty,
                    UnitPrice: unitPrice,
                },
                LineNum: index + 1,
            };
        });

        if (lines.length === 0) {
            console.error('[QB Invoice Sync] No line items found for quote:', quote.number);
            return null;
        }

        const discountAmount = Number(quote.discount || 0);
        if (discountAmount > 0) {
            lines.push({
                DetailType: 'DiscountLineDetail' as any,
                Amount: discountAmount,
                Description: 'Discount',
                SalesItemLineDetail: {} as any,
                LineNum: lines.length + 1,
            });
        }

        // TIER 1: Standard Invoice Payload
        const standardPayload = {
            CustomerRef: { value: qbCustomerId },
            Line: lines,
            DueDate: quote.validUntil ? quote.validUntil.toISOString().split('T')[0] : undefined,
            DocNumber: quote.invoice?.number || quote.number.replace('Q-', 'INV-'),
            BillEmail: { Address: quote.customer.email },
            BillAddr: {
                Line1: quote.customer.address,
                City: quote.customer.city,
                CountrySubDivisionCode: quote.customer.state,
                PostalCode: quote.customer.zip,
            },
            EmailStatus: 'NeedToSend',
            AllowOnlineCreditCardPayment: true,
            AllowOnlineACHPayment: true,
            CustomerMemo: {
                value: `Quote #${quote.number} - Pioneer Concrete Coatings`,
            },
        };

        let result;
        let syncStatusNote = null;

        try {
            // ATTEMPT 1: Standard
            console.log(`[QB Sync] Attempting STANDARD sync for Quote ${quote.number}`);
            result = await qbApiRequest('POST', 'invoice', connection.realmId, connection.accessToken, standardPayload);
        } catch (firstError: any) {
            const isAuthError = firstError.message?.includes('403') || firstError.message?.includes('3100');
            
            if (isAuthError) {
                // ATTEMPT 2: Safe Mode (No Payment Flags)
                console.warn('[QB Sync] 403 Detected. Attempting Tier 2: Safe Mode (no payments)...');
                syncStatusNote = 'Sync successful in Safe Mode (Payment links were restricted)';
                
                const safePayload = { ...standardPayload };
                delete (safePayload as any).AllowOnlineCreditCardPayment;
                delete (safePayload as any).AllowOnlineACHPayment;
                
                try {
                    result = await qbApiRequest('POST', 'invoice', connection.realmId, connection.accessToken, safePayload);
                } catch (secondError: any) {
                    if (secondError.message?.includes('403') || secondError.message?.includes('3100')) {
                        // ATTEMPT 3: Minimalist (Minimal Metadata)
                        console.warn('[QB Sync] 403 Still persists. Attempting Tier 3: Minimalist...');
                        syncStatusNote = 'Sync successful in Minimalist Mode (Detailed metadata was restricted)';
                        
                        const minPayload = {
                            CustomerRef: { value: qbCustomerId },
                            Line: lines,
                            DocNumber: standardPayload.DocNumber,
                            DueDate: standardPayload.DueDate,
                        };
                        
                        result = await qbApiRequest('POST', 'invoice', connection.realmId, connection.accessToken, minPayload);
                    } else {
                        throw secondError;
                    }
                }
            } else {
                throw firstError;
            }
        }

        const qbInvoiceId = result?.Invoice?.Id;
        if (!qbInvoiceId) {
            throw new Error('QuickBooks did not return an invoice ID');
        }

        console.log(`[QB Sync] Created QB invoice: ${qbInvoiceId}. Syncing Payment Link...`);

        // Only try to fetch payment link if we aren't in a stripped-down mode that likely blocks it
        let paymentLink: string | null = null;
        if (!syncStatusNote) {
            try {
                const invoiceDetail = await qbApiRequest(
                    'GET',
                    `invoice/${qbInvoiceId}?include=invoiceLink`,
                    connection.realmId,
                    connection.accessToken
                );
                paymentLink = invoiceDetail?.Invoice?.InvoiceLink || null;
            } catch (err) {
                console.warn(`[QB Sync] Skipping payment link retrieval for ${qbInvoiceId} due to restriction.`);
            }
        }

        if (quote.invoice) {
            await db.invoice.update({
                where: { id: quote.invoice.id },
                data: {
                    qbInvoiceId,
                    paymentLink,
                    status: 'PENDING',
                    lastSyncAt: new Date(),
                    lastSyncError: syncStatusNote || null, 
                },
            });
        }

        return qbInvoiceId;
    } catch (error: any) {
        console.error('[QB Invoice Sync] PROCESSED ERROR:', error.message);
        
        if (quote.invoice) {
            await db.invoice.update({
                where: { id: quote.invoice.id },
                data: {
                    status: 'FAILED',
                    lastSyncError: error.message || 'Unknown QuickBooks Error',
                    lastSyncAt: new Date(),
                },
            });
        }
        return null;
    }
}

/**
 * Create an invoice in the CRM and sync to QuickBooks
 */
export async function createInvoiceFromQuote(quoteId: string) {
    const quote = await db.quote.findUnique({
        where: { id: quoteId },
        include: { customer: true, invoice: true },
    });

    if (!quote) throw new Error('Quote not found');
    if (quote.invoice) return quote.invoice;

    const invoice = await db.invoice.create({
        data: {
            number: `INV-${Date.now()}`,
            quoteId: quote.id,
            customerId: quote.customer.id,
            amount: quote.total,
            status: 'PENDING',
            dueDate: quote.validUntil,
        },
    });

    return invoice;
}

/**
 * Manually retry synchronization
 */
export async function retryInvoiceSync(invoiceId: string) {
    const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
        include: { quote: true }
    });

    if (!invoice) throw new Error('Invoice not found');

    await db.invoice.update({
        where: { id: invoiceId },
        data: { 
            status: 'PENDING',
            lastSyncError: 'Retrying with enhanced fallbacks...',
            lastSyncAt: new Date()
        }
    });

    const result = await createQBInvoice(invoice.quoteId);

    const { revalidatePath } = await import('next/cache');
    revalidatePath('/app/crm/invoices');
    revalidatePath('/app/crm/diagnostics');
    revalidatePath(`/quote/${invoice.quoteId}`);

    return { success: !!result, qbInvoiceId: result };
}

/**
 * Record a Stripe payment against the matching QuickBooks invoice
 */
export async function recordStripePaymentInQB(quoteId: string, amountPaid: number, stripeSessionId: string) {
    const quote = await db.quote.findUnique({
        where: { id: quoteId },
        include: { customer: true, invoice: true },
    });

    if (!quote?.invoice?.qbInvoiceId) return;

    const businessId = quote.customer.businessId;
    const connection = await getQBConnection(businessId);
    if (!connection) return;

    try {
        await qbApiRequest('POST', 'payment', connection.realmId, connection.accessToken, {
            CustomerRef: { value: quote.customer.qbCustomerId },
            TotalAmt: amountPaid,
            Line: [{
                Amount: amountPaid,
                LinkedTxn: [{ TxnId: quote.invoice.qbInvoiceId, TxnType: 'Invoice' }],
            }],
            PaymentMethodRef: { value: '1' },
            PrivateNote: `Stripe payment — Session ${stripeSessionId}`,
        });
        console.log(`[QB] Recorded Stripe payment of $${amountPaid} against QB invoice ${quote.invoice.qbInvoiceId}`);
    } catch (err: any) {
        console.warn('[QB] Could not record Stripe payment in QB:', err.message);
    }
}
