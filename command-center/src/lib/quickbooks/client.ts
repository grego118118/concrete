'use strict';

/**
 * QuickBooks Online OAuth2 Client
 * 
 * Handles OAuth2 token exchange, refresh, and API calls to QuickBooks Online.
 * Uses the REST API directly (no MCP dependency for OAuth).
 */

const QB_AUTH_URL = 'https://appcenter.intuit.com/connect/oauth2';
const QB_TOKEN_URL = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';

// Sandbox vs Production base URLs
const QB_API_BASE = {
    sandbox: 'https://sandbox-quickbooks.api.intuit.com',
    production: 'https://quickbooks.api.intuit.com',
};

export interface QBTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number; // seconds
    realmId: string;
}

export interface QBConfig {
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    environment: 'sandbox' | 'production';
}

function getConfig(): QBConfig {
    const clientId = process.env.QUICKBOOKS_CLIENT_ID;
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET;
    const environment = (process.env.QUICKBOOKS_ENVIRONMENT || 'sandbox') as 'sandbox' | 'production';
    
    // Dynamic Redirect URI logic
    let redirectUri = process.env.QUICKBOOKS_REDIRECT_URI;
    
    // In production, force the correct domain even if env var is missing or set to localhost
    const isProduction = process.env.NODE_ENV === 'production' || environment === 'production' || !!process.env.VERCEL;
    
    if (isProduction && (!redirectUri || redirectUri.includes('localhost'))) {
        redirectUri = 'https://pioneerconcretecoatings.com/app/api/quickbooks/callback';
    } else if (!redirectUri) {
        redirectUri = 'http://localhost:3000/app/api/quickbooks/callback';
    }

    if (!clientId) throw new Error('Missing QUICKBOOKS_CLIENT_ID environment variable');
    if (!clientSecret) throw new Error('Missing QUICKBOOKS_CLIENT_SECRET environment variable');
    if (!redirectUri) throw new Error('Missing QUICKBOOKS_REDIRECT_URI environment variable');

    return { clientId, clientSecret, redirectUri, environment };
}

/**
 * Build the QuickBooks OAuth2 authorization URL
 */
export function getAuthorizationUrl(state?: string): string {
    const config = getConfig();
    const params = new URLSearchParams({
        client_id: config.clientId,
        response_type: 'code',
        scope: 'com.intuit.quickbooks.accounting',
        redirect_uri: config.redirectUri,
        state: state || 'auth_state',
    });

    console.log('[QB Auth] Generating Authorization URL');
    console.log('[QB Auth] State:', state || 'auth_state');
    console.log('[QB Auth] Redirect URI:', config.redirectUri);
    console.log('[QB Auth] Environment:', config.environment);

    return `${QB_AUTH_URL}?${params.toString()}`;
}

/**
 * Exchange authorization code for access/refresh tokens
 */
export async function exchangeCodeForTokens(code: string, realmId: string): Promise<QBTokens> {
    const config = getConfig();
    const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

    const response = await fetch(QB_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: config.redirectUri,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to exchange code for tokens: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        realmId,
    };
}

/**
 * Refresh an expired access token
 */
export async function refreshAccessToken(refreshToken: string): Promise<QBTokens & { realmId: string }> {
    const config = getConfig();
    const basicAuth = Buffer.from(`${config.clientId}:${config.clientSecret}`).toString('base64');

    const response = await fetch(QB_TOKEN_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Basic ${basicAuth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'Accept': 'application/json',
        },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to refresh token: ${response.status} ${errorText}`);
    }

    const data = await response.json();

    return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        realmId: '', // Caller must set this
    };
}

/**
 * Make an authenticated API call to QuickBooks
 */
export async function qbApiRequest(
    method: 'GET' | 'POST',
    endpoint: string,
    realmId: string,
    accessToken: string,
    body?: any
): Promise<any> {
    const config = getConfig();
    const baseUrl = QB_API_BASE[config.environment];
    const url = `${baseUrl}/v3/company/${realmId}/${endpoint}`;

    const headers: Record<string, string> = {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`QB API Error (${response.status}): ${errorText}`);
    }

    return response.json();
}
