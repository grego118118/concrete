import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/quickbooks/client';

/**
 * GET /app/api/quickbooks/connect
 * Redirects the user to QuickBooks OAuth authorization page
 */
export async function GET(request: NextRequest) {
    try {
        const authUrl = getAuthorizationUrl('connect');
        return NextResponse.redirect(authUrl);
    } catch (error: any) {
        console.error('[QB Connect] Error:', error);
        return NextResponse.redirect(
            new URL('/app/crm/settings?qb_error=config', request.url)
        );
    }
}
