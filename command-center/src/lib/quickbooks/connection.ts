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
export async function getQBConnection() {
    const connection = await db.quickBooksConnection.findFirst({
        where: { isActive: true },
    });

    if (!connection) return null;

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
    expiresIn: number
) {
    // Deactivate any existing connections
    await db.quickBooksConnection.updateMany({
        where: { isActive: true },
        data: { isActive: false },
    });

    // Fetch company name from QB
    let companyName = 'QuickBooks';
    try {
        const companyInfo = await qbApiRequest(
            'GET',
            'companyinfo/' + realmId,
            realmId,
            accessToken
        );
        companyName = companyInfo?.CompanyInfo?.CompanyName || 'QuickBooks';
    } catch (e) {
        console.warn('[QB] Could not fetch company name:', e);
    }

    // Upsert (create or update based on realmId)
    return await db.quickBooksConnection.upsert({
        where: { realmId },
        create: {
            realmId,
            accessToken,
            refreshToken,
            tokenExpiry: new Date(Date.now() + expiresIn * 1000),
            companyName,
            isActive: true,
        },
        update: {
            accessToken,
            refreshToken,
            tokenExpiry: new Date(Date.now() + expiresIn * 1000),
            companyName,
            isActive: true,
        },
    });
}

/**
 * Disconnect QuickBooks (deactivate connection)
 */
export async function disconnectQB() {
    await db.quickBooksConnection.updateMany({
        where: { isActive: true },
        data: { isActive: false },
    });
}

/**
 * Get QB connection status (for the settings page UI)
 */
export async function getQBStatus() {
    const connection = await db.quickBooksConnection.findFirst({
        where: { isActive: true },
    });

    if (!connection) {
        return { connected: false };
    }

    return {
        connected: true,
        companyName: connection.companyName,
        connectedAt: connection.createdAt,
        tokenExpiry: connection.tokenExpiry,
    };
}
