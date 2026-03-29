import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    console.warn('[Stripe] STRIPE_SECRET_KEY is not set');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', {
    apiVersion: '2025-02-24.acacia',
});

export function isStripeConfigured() {
    const key = process.env.STRIPE_SECRET_KEY;
    return !!key && key !== 'sk_test_...' && key.startsWith('sk_');
}

export function getStripeMode(): 'live' | 'test' | 'unconfigured' {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key || key === 'sk_test_...') return 'unconfigured';
    if (key.startsWith('sk_live_')) return 'live';
    return 'test';
}
