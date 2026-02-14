import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("Stripe-Signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as any;

    if (event.type === "checkout.session.completed") {
        // Retrieve the quote ID from metadata
        const quoteId = session.metadata?.quoteId;

        if (quoteId) {
            const isDeposit = session.metadata?.type === "DEPOSIT";
            const scheduledDate = session.metadata?.scheduledDate;

            // Update Invoice status
            await prisma.invoice.update({
                where: { quoteId },
                data: {
                    status: isDeposit ? "DEPOSIT_PAID" : "PAID",
                    paidAt: new Date(),
                    stripeId: session.payment_intent
                }
            });

            // Update Quote status and optionally store the scheduled date
            const quoteUpdate: any = { status: "APPROVED" };
            if (scheduledDate) {
                quoteUpdate.scheduledDate = new Date(scheduledDate);
            }

            await prisma.quote.update({
                where: { id: quoteId },
                data: quoteUpdate
            });

            console.log(`${isDeposit ? "Deposit" : "Full"} payment successful for Quote ${quoteId}${scheduledDate ? ` — Scheduled: ${scheduledDate}` : ""}`);
        }
    }

    return new NextResponse(null, { status: 200 });
}
