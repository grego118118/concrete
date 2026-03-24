import { NextRequest, NextResponse } from 'next/server';
import { exchangeCodeForTokens } from '@/lib/quickbooks/client';
import { saveQBConnection } from '@/lib/quickbooks/connection';

/**
 * GET /app/api/quickbooks/callback
 * OAuth2 callback handler — exchanges authorization code for tokens
 */
export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const realmId = searchParams.get('realmId');
    const error = searchParams.get('error');

    // Handle OAuth denial/error
    if (error) {
        console.error('[QB Callback] OAuth error:', error);
        return NextResponse.redirect(
            new URL('/app/crm/settings?qb_error=denied', request.url)
        );
    }

    if (!code || !realmId) {
        console.error('[QB Callback] Missing code or realmId');
        return NextResponse.redirect(
            new URL('/app/crm/settings?qb_error=missing_params', request.url)
        );
    }

    try {
        // Exchange the authorization code for tokens
        const tokens = await exchangeCodeForTokens(code, realmId);

        // Save the connection to the database
        await saveQBConnection(
            tokens.realmId,
            tokens.accessToken,
            tokens.refreshToken,
            tokens.expiresIn
        );

        console.log('[QB Callback] Successfully connected to QuickBooks');

        // Redirect back to settings with success
        return NextResponse.redirect(
            new URL('/app/crm/settings?qb_connected=true', request.url)
        );
    } catch (err: any) {
        console.error('[QB Callback] Token exchange failed:', err);
        return NextResponse.redirect(
            new URL('/app/crm/settings?qb_error=token_exchange', request.url)
        );
    }
}
