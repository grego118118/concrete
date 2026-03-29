import { NextResponse } from 'next/server';
import { stripe, isStripeConfigured, getStripeMode } from '@/lib/stripe';

export async function GET() {
    if (!isStripeConfigured()) {
        return NextResponse.json({ connected: false });
    }

    try {
        await stripe.balance.retrieve();
        return NextResponse.json({ connected: true, mode: getStripeMode() });
    } catch {
        return NextResponse.json({ connected: false });
    }
}
