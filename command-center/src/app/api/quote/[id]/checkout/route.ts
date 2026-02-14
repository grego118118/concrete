import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: quoteId } = await params;
        const { scheduledDate } = await req.json();

        const quote = await db.quote.findUnique({
            where: { id: quoteId },
            include: { customer: true }
        });

        if (!quote) {
            return NextResponse.json({ error: "Quote not found" }, { status: 404 });
        }

        // Calculate 50% deposit in cents
        const totalAmount = Number(quote.total);
        const depositAmount = Math.round((totalAmount * 0.5) * 100);

        // Use NEXTAUTH_URL or build from request headers
        const origin = process.env.NEXTAUTH_URL || new URL(req.url).origin;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price_data: {
                        currency: "usd",
                        product_data: {
                            name: `50% Deposit for Quote #${quote.number}`,
                            description: scheduledDate ? `Preferred Start Date: ${scheduledDate}` : "Deposit payment to confirm your project",
                        },
                        unit_amount: depositAmount,
                    },
                    quantity: 1,
                },
            ],
            mode: "payment",
            success_url: `${origin}/quote/${quoteId}?success=true`,
            cancel_url: `${origin}/quote/${quoteId}?canceled=true`,
            metadata: {
                quoteId,
                scheduledDate: scheduledDate || "",
                customerId: quote.customerId,
                type: "DEPOSIT",
            },
            customer_email: quote.customer.email,
        });

        // Create or update Invoice record
        await db.invoice.upsert({
            where: { quoteId },
            create: {
                quoteId,
                customerId: quote.customerId,
                amount: quote.total,
                status: "PENDING",
                number: `INV-${quote.number}`
            },
            update: {
                stripeId: session.id
            }
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error("[PUBLIC_CHECKOUT]", error);
        return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
    }
}
