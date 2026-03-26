import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /app/api/quickbooks/debug
 * Returns current QuickBooks configuration (sanitized) to help troubleshoot production issues.
 */
export async function GET(request: NextRequest) {
    const environment = process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox';
    const hasClientId = !!process.env.QUICKBOOKS_CLIENT_ID;
    const hasClientSecret = !!process.env.QUICKBOOKS_CLIENT_SECRET;
    const redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;
    const nodeEnv = process.env.NODE_ENV;
    const isVercel = !!process.env.VERCEL;
    
    // Logic from client.ts to see what will actually be used
    let finalRedirectUri = redirectUri;
    const isProduction = nodeEnv === 'production' || environment === 'production' || isVercel;
    
    if (isProduction && (!finalRedirectUri || finalRedirectUri.includes('localhost'))) {
        finalRedirectUri = 'https://pioneerconcretecoatings.com/app/api/quickbooks/callback';
    }

    return NextResponse.json({
        config: {
            environment,
            nodeEnv,
            isVercel,
            isProductionDetected: isProduction,
            hasClientId,
            hasClientSecret,
            configuredRedirectUri: redirectUri || 'NOT SET',
            finalRedirectUriUsed: finalRedirectUri || 'NOT SET',
        },
        tip: "Ensure 'finalRedirectUriUsed' exactly matches one of the redirect URIs in your Intuit Developer Portal (Production tab)."
    });
}
