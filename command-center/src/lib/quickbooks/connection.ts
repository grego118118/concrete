'use server';

/**
 * QuickBooks Connection Manager
 * 
 * Manages the QB connection lifecycle: get active connection,
 * save tokens, refresh expired tokens, and disconnect.
 */

import { db } from '@/lib/db';
import { refreshAccessToken, qbApiRequest } from './client';

/**
 * Get the active QuickBooks connection (with auto-refresh if expired)
 */
export async function getQBConnection(businessId: string) {
    const connection = await db.quickBooksConnection.findFirst({
        where: { businessId, isActive: true },
    });

    if (!connection) {
        console.log(`[QB Connection] No active connection found for business ${businessId}`);
        return null;
    }

    // Auto-refresh if token is expired (or expires within 5 minutes)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (connection.tokenExpiry < fiveMinutesFromNow) {
        try {
            const refreshed = await refreshAccessToken(connection.refreshToken);
            const updated = await db.quickBooksConnection.update({
                where: { id: connection.id },
                data: {
                    accessToken: refreshed.accessToken,
                    refreshToken: refreshed.refreshToken,
                    tokenExpiry: new Date(Date.now() + refreshed.expiresIn * 1000),
                },
            });
            return updated;
        } catch (error) {
            console.error('[QB] Token refresh failed:', error);
            // Mark connection as inactive if refresh fails
            await db.quickBooksConnection.update({
                where: { id: connection.id },
                data: { isActive: false },
            });
            return null;
        }
    }

    return connection;
}

/**
 * Save a new QuickBooks connection (after OAuth)
 */
export async function saveQBConnection(
    realmId: string,
    accessToken: string,
    refreshToken: string,
    expiresIn: number,
    businessId: string
) {
    // Deactivate any existing connections for this business
    await db.quickBooksConnection.updateMany({
        where: { businessId },
        data: { isActive: false },
    });

    // Fetch company name and email from QB
    let companyName = 'QuickBooks';
    let primaryEmail = null;
    try {
        const companyInfo = await qbApiRequest(
            'GET',
            'companyinfo/' + realmId,
            realmId,
            accessToken
        );
        companyName = companyInfo?.CompanyInfo?.CompanyName || 'QuickBooks';
        primaryEmail = companyInfo?.CompanyInfo?.PrimaryEmailAddr?.Address || null;
    } catch (e) {
        console.warn('[QB] Could not fetch company info:', e);
    }

    // Determine environment from realmId or config
    const { environment } = await import('./client').then(m => m.getConfig());

    // Upsert (create or update based on businessId)
    return await db.quickBooksConnection.upsert({
        where: { businessId },
        create: {
            realmId,
            accessToken,
            refreshToken,
            tokenExpiry: new Date(Date.now() + expiresIn * 1000),
            companyName,
            primaryEmail,
            environment,
            isActive: true,
            businessId,
        },
        update: {
            realmId,
            accessToken,
            refreshToken,
            tokenExpiry: new Date(Date.now() + expiresIn * 1000),
            companyName,
            primaryEmail,
            environment,
            isActive: true,
        },
    });
}

/**
 * Disconnect QuickBooks (deactivate connection)
 */
export async function disconnectQB(businessId: string) {
    await db.quickBooksConnection.updateMany({
        where: { businessId },
        data: { isActive: false },
    });
}

/**
 * Get QB connection status (for the settings page UI)
 */
export async function getQBStatus(businessId: string) {
    const connection = await db.quickBooksConnection.findUnique({
        where: { businessId },
    });

    if (!connection) {
        return { connected: false };
    }

    return {
        connected: true,
        companyName: connection.companyName,
        primaryEmail: connection.primaryEmail,
        environment: connection.environment,
        connectedAt: connection.createdAt,
        tokenExpiry: connection.tokenExpiry,
    };
}
