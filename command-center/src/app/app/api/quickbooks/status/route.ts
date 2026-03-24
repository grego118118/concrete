import { NextResponse } from 'next/server';
import { getQBStatus } from '@/lib/quickbooks/connection';

/**
 * GET /app/api/quickbooks/status
 * Returns the current QuickBooks connection status
 */
export async function GET() {
    try {
        const status = await getQBStatus();
        return NextResponse.json(status);
    } catch (error: any) {
        console.error('[QB Status] Error:', error);
        return NextResponse.json({ connected: false });
    }
}
