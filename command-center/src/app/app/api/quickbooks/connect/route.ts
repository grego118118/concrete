import { NextRequest, NextResponse } from 'next/server';
import { getAuthorizationUrl } from '@/lib/quickbooks/client';
import { auth } from '@/auth';

/**
 * GET /app/api/quickbooks/connect
 * Redirects the user to QuickBooks OAuth authorization page
 */
export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        const businessId = (session?.user as any)?.businessId;

        if (!businessId) {
            console.error('[QB Connect] No businessId in session');
            return NextResponse.redirect(
                new URL('/app/crm/settings?qb_error=unauthorized', request.url)
            );
        }

        const authUrl = getAuthorizationUrl(businessId);
        return NextResponse.redirect(authUrl);
    } catch (error: any) {
        console.error('[QB Connect] Error:', error);
        return NextResponse.redirect(
            new URL('/app/crm/settings?qb_error=config', request.url)
        );
    }
}
