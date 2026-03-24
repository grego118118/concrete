import { NextRequest, NextResponse } from 'next/server';
import { disconnectQB } from '@/lib/quickbooks/connection';

/**
 * POST /app/api/quickbooks/disconnect
 * Disconnects the QuickBooks integration
 */
export async function POST(request: NextRequest) {
    try {
        await disconnectQB();
        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[QB Disconnect] Error:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
