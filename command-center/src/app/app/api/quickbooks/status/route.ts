import { NextResponse } from 'next/server';
import { getQBStatus } from '@/lib/quickbooks/connection';
import { auth } from '@/auth';

/**
 * GET /app/api/quickbooks/status
 * Returns the current QuickBooks connection status for the logged-in business
 */
export async function GET() {
    try {
        const session = await auth();
        const businessId = (session?.user as any)?.businessId;

        if (!businessId) {
            return NextResponse.json({ connected: false });
        }

        const status = await getQBStatus(businessId);
        return NextResponse.json(status);
    } catch (error: any) {
        console.error('[QB Status] Error:', error);
        return NextResponse.json({ connected: false });
    }
}
