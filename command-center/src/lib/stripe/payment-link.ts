'use server';

import { stripe, isStripeConfigured } from './index';

/**
 * Creates a permanent Stripe Payment Link for a quote deposit.
 * Payment Links don't expire, making them safe to send in emails.
 */
export async function createDepositPaymentLink(params: {
    quoteNumber: string;
    depositAmount: number; // in dollars
    quoteId: string;
    invoiceId: string;
}): Promise<string | null> {
    if (!isStripeConfigured()) {
        console.warn('[Stripe] Skipping payment link — Stripe is not configured');
        return null;
    }

    try {
        // Create a one-time price for this deposit
        const price = await stripe.prices.create({
            currency: 'usd',
            unit_amount: Math.round(params.depositAmount * 100), // convert to cents
            product_data: {
                name: `50% Deposit — Quote #${params.quoteNumber}`,
                description: 'Pioneer Concrete Coatings — Project Deposit',
            },
        });

        const paymentLink = await stripe.paymentLinks.create({
            line_items: [{ price: price.id, quantity: 1 }],
            metadata: {
                quoteId: params.quoteId,
                invoiceId: params.invoiceId,
                quoteNumber: params.quoteNumber,
            },
            after_completion: {
                type: 'hosted_confirmation',
                hosted_confirmation: {
                    custom_message: "Thank you! Your deposit has been received. We'll be in touch within 24 hours to confirm your project schedule.",
                },
            },
        });

        console.log(`[Stripe] Created payment link for Quote #${params.quoteNumber}: ${paymentLink.url}`);
        return paymentLink.url;
    } catch (err: any) {
        console.error('[Stripe] Failed to create payment link:', err.message);
        return null;
    }
}
