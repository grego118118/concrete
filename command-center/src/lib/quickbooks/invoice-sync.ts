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
        // Build QB Invoice line items from quote items
        const lines = quote.items.map((item, index) => ({
            DetailType: 'SalesItemLineDetail',
            Amount: Number(item.total),
            Description: item.description,
            SalesItemLineDetail: {
                Qty: item.quantity,
                UnitPrice: Number(item.unitPrice),
            },
            LineNum: index + 1,
        }));

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

        const result = await qbApiRequest(
            'POST',
            'invoice',
            connection.realmId,
            connection.accessToken,
            qbInvoice
        );

        const qbInvoiceId = result?.Invoice?.Id;
        if (!qbInvoiceId) {
            console.error('[QB Invoice Sync] No invoice ID returned. Full response:', JSON.stringify(result, null, 2));
            return null;
        }

        console.log(`[QB Invoice Sync] Created QB invoice: ${qbInvoiceId}`);

        // Get the payment link from QB (if available)
        let paymentLink: string | null = null;
        try {
            // minorversion=70 and include=invoiceLink are required for the link to consistently appear
            // (qbApiRequest now adds minorversion=70 automatically)
            const invoiceDetail = await qbApiRequest(
                'GET',
                `invoice/${qbInvoiceId}?include=invoiceLink`,
                connection.realmId,
                connection.accessToken
            );
            paymentLink = invoiceDetail?.Invoice?.InvoiceLink || null;
            if (paymentLink) {
                console.log(`[QB Invoice Sync] Retrieved InvoiceLink: ${paymentLink}`);
            } else {
                console.warn(`[QB Invoice Sync] No InvoiceLink in response for invoice ${qbInvoiceId}`);
            }
        } catch (err) {
            console.warn('[QB Invoice Sync] Payment link retrieval failed:', err);
        }

        // Update our invoice record with the QB invoice ID
        if (quote.invoice) {
            await db.invoice.update({
                where: { id: quote.invoice.id },
                data: {
                    qbInvoiceId,
                    paymentLink,
                },
            });
        }

        return qbInvoiceId;
    } catch (error) {
        console.error('[QB Invoice Sync] Failed to create QB invoice:', error);
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
