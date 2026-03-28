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
 * Create a QuickBooks invoice from an accepted quote
 */
export async function createQBInvoice(quoteId: string): Promise<string | null> {
    // Get the quote with all details (including customer to get businessId)
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

    // If invoice already has a QB ID, skip
    if (quote.invoice?.qbInvoiceId) {
        console.log(`[QB Invoice Sync] Invoice already synced (QB ID: ${quote.invoice.qbInvoiceId})`);
        return quote.invoice.qbInvoiceId;
    }

    // Ensure customer is synced to QB
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
        
        // Build QB Invoice line items from quote items
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
                    // Note: If sync failures persist, check if a specific ItemRef is required by QB settings
                },
                LineNum: index + 1,
            };
        });

        if (lines.length === 0) {
            console.error('[QB Invoice Sync] No line items found for quote:', quote.number);
            return null;
        }

        // Add discount as a separate line if present
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

        // Build the QB invoice
        const qbInvoice = {
            CustomerRef: {
                value: qbCustomerId,
            },
            Line: lines,
            DueDate: quote.validUntil ? quote.validUntil.toISOString().split('T')[0] : undefined,
            // Use the CRM invoice number if it exists, otherwise the quote number
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

        console.log(`[QB Invoice Sync] Posting invoice to QuickBooks for Company: ${connection.realmId}`);
        let result;
        try {
            result = await qbApiRequest(
                'POST',
                'invoice',
                connection.realmId,
                connection.accessToken,
                qbInvoice
            );
        } catch (postError: any) {
            // Check for 403 ApplicationAuthorizationFailed (003100)
            const isAuthError = postError.message?.includes('403') || postError.message?.includes('3100');
            
            if (isAuthError) {
                console.warn('[QB Invoice Sync] 403 Detected. Attempting "Safe Mode" retry without payment flags...');
                
                // Remove the flags that usually trigger the 403 if Payments isn't fully enabled in the app portal
                const safeInvoice = { ...qbInvoice };
                delete (safeInvoice as any).AllowOnlineCreditCardPayment;
                delete (safeInvoice as any).AllowOnlineACHPayment;
                
                result = await qbApiRequest(
                    'POST',
                    'invoice',
                    connection.realmId,
                    connection.accessToken,
                    safeInvoice
                );
                console.log('[QB Invoice Sync] "Safe Mode" retry successful. Invoice created without payment links.');
            } else {
                throw postError; // Re-throw if it's not a 403
            }
        }

        const qbInvoiceId = result?.Invoice?.Id;
        if (!qbInvoiceId) {
            console.error('[QB Invoice Sync] QuickBooks did not return an invoice ID. Response:', JSON.stringify(result, null, 2));
            return null;
        }

        console.log(`[QB Invoice Sync] Created QB invoice: ${qbInvoiceId}. Syncing Payment Link...`);

        // Get the payment link from QB (if available)
        let paymentLink: string | null = null;
        try {
            const invoiceDetail = await qbApiRequest(
                'GET',
                `invoice/${qbInvoiceId}?include=invoiceLink`,
                connection.realmId,
                connection.accessToken
            );
            
            paymentLink = invoiceDetail?.Invoice?.InvoiceLink || null;
            
            if (paymentLink) {
                console.log(`[QB Invoice Sync] Successfully retrieved PaymentLink: ${paymentLink}`);
            } else {
                console.warn(`[QB Invoice Sync] No InvoiceLink in QB response for ${qbInvoiceId}. Ensure QB Payments is enabled.`);
            }
        } catch (err) {
            console.error(`[QB Invoice Sync] Error retrieving payment link for invoice ${qbInvoiceId}:`, err);
        }

        // Update our invoice record with the QB invoice ID
        if (quote.invoice) {
            await db.invoice.update({
                where: { id: quote.invoice.id },
                data: {
                    qbInvoiceId,
                    paymentLink,
                    status: 'PENDING',
                    lastSyncAt: new Date(),
                    lastSyncError: null, // Clear any previous errors
                },
            });
        }

        return qbInvoiceId;
    } catch (error: any) {
        console.error('[QB Invoice Sync] CRITICAL ERROR:', error.message);
        
        // Persist the error for diagnostics
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
 * Called when a quote is accepted/approved
 */
export async function createInvoiceFromQuote(quoteId: string) {
    const quote = await db.quote.findUnique({
        where: { id: quoteId },
        include: { customer: true, invoice: true },
    });

    if (!quote) throw new Error('Quote not found');
    if (quote.invoice) {
        console.log('[QB Invoice] Invoice already exists for this quote');
        return quote.invoice;
    }

    // Create the CRM invoice
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

    // Sync to QuickBooks in the background (non-blocking)
    createQBInvoice(quoteId).catch(err =>
        console.warn('[QB Invoice] QB sync failed (non-critical):', err)
    );

    return invoice;
}

/**
 * Manually retry synchronization for a failed invoice
 */
export async function retryInvoiceSync(invoiceId: string) {
    const invoice = await db.invoice.findUnique({
        where: { id: invoiceId },
        include: { quote: true }
    });

    if (!invoice) throw new Error('Invoice not found');

    console.log(`[QB Diagnostics] Retrying sync for Invoice ${invoice.number}`);

    // Increment sync attempt or just clear error
    await db.invoice.update({
        where: { id: invoiceId },
        data: { 
            status: 'PENDING',
            lastSyncError: 'Retrying...',
            lastSyncAt: new Date()
        }
    });

    // Run sync
    const result = await createQBInvoice(invoice.quoteId);

    // Revalidate paths
    const { revalidatePath } = await import('next/cache');
    revalidatePath('/app/crm/invoices');
    revalidatePath('/app/crm/diagnostics');
    revalidatePath(`/quote/${invoice.quoteId}`);

    return { success: !!result, qbInvoiceId: result };
}
