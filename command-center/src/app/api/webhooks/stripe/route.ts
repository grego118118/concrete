import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get("stripe-signature") as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object as any;
        const { quoteId, scheduledDate, customerId } = session.metadata;

        if (quoteId && scheduledDate) {
            await db.$transaction(async (tx) => {
                // 1. Update Quote
                const quote = await tx.quote.update({
                    where: { id: quoteId },
                    data: { status: "ACCEPTED" as any }
                });

                // 2. Find Business
                let business = await tx.business.findFirst();
                if (!business) {
                    business = await tx.business.create({
                        data: { name: "Pioneer Concrete Coatings", brandKit: {} }
                    });
                }

                // 3. Create Job
                await tx.job.create({
                    data: {
                        title: `Job for Quote #${quote.number}`,
                        description: `Automatically created from paid deposit.`,
                        status: "SCHEDULED" as any,
                        scheduledAt: new Date(scheduledDate),
                        customerId,
                        businessId: business.id,
                        // Link quote if there's a field (check schema)
                    }
                });
            });

            console.log(`Successfully processed deposit for Quote ${quoteId}`);
        }
    }

    return new NextResponse(null, { status: 200 });
}
