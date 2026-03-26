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
    const cleanEnvironment = environment.trim();
    const cleanRedirectUri = (redirectUri || '').trim();
    const isProduction = nodeEnv === 'production' || cleanEnvironment === 'production' || isVercel;
    
    let finalRedirectUriUsed = cleanRedirectUri;
    if (isProduction && (!finalRedirectUriUsed || finalRedirectUriUsed.includes('localhost'))) {
        finalRedirectUriUsed = 'https://pioneerconcretecoatings.com/app/api/quickbooks/callback';
    }

    // Capture all QuickBooks-related env keys to see if anything is misnamed
    const qbKeys = Object.keys(process.env).filter(k => k.startsWith('QUICKBOOKS_'));

    return NextResponse.json({
        config: {
            environment: cleanEnvironment,
            nodeEnv,
            isVercel,
            isProductionDetected: isProduction,
            hasClientId,
            hasClientSecret,
            configuredRedirectUri: cleanRedirectUri || 'NOT SET',
            finalRedirectUriUsed: finalRedirectUriUsed || 'NOT SET',
            availableEnvKeys: qbKeys
        },
        tip: "Ensure 'finalRedirectUriUsed' exactly matches one of the redirect URIs in your Intuit Developer Portal (Production tab)."
    });
}
