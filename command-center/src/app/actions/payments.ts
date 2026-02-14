'use server'

import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { headers } from "next/headers";

export async function createDepositCheckoutSession(quoteId: string, scheduledDate: string) {
    const quote = await db.quote.findUnique({
        where: { id: quoteId },
        include: { customer: true }
    });

    if (!quote) throw new Error("Quote not found");

    const origin = (await headers()).get("origin");

    // Calculate 50% deposit in cents
    const totalAmount = Number(quote.total);
    const depositAmount = Math.round((totalAmount * 0.5) * 100);

    const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    product_data: {
                        name: `50% Deposit for Quote #${quote.number}`,
                        description: `Scheduled Date: ${scheduledDate}`,
                    },
                    unit_amount: depositAmount,
                },
                quantity: 1,
            },
        ],
        mode: "payment",
        success_url: `${origin}/crm/quotes/${quoteId}?success=true`,
        cancel_url: `${origin}/crm/quotes/${quoteId}?canceled=true`,
        metadata: {
            quoteId,
            scheduledDate,
            customerId: quote.customerId,
            type: "DEPOSIT",
        },
        customer_email: quote.customer.email,
    });

    return session.url;
}
