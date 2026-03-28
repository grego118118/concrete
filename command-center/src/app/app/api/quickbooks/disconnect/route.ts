import { NextRequest, NextResponse } from 'next/server';
import { disconnectQB } from '@/lib/quickbooks/connection';
import { auth } from '@/auth';

/**
 * POST /app/api/quickbooks/disconnect
 * Disconnects the QuickBooks integration for the logged-in business
 */
export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const businessId = (session?.user as any)?.businessId;

        if (!businessId) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await disconnectQB(businessId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[QB Disconnect] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
