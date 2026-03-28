'use server';

/**
 * QuickBooks Customer Sync
 * 
 * Syncs CRM customers to QuickBooks Online.
 * Creates new QB customers or finds existing ones.
 */

import { db } from '@/lib/db';
import { getQBConnection } from './connection';
import { qbApiRequest } from './client';

interface QBCustomerData {
    DisplayName: string;
    PrimaryEmailAddr?: { Address: string };
    PrimaryPhone?: { FreeFormNumber: string };
    BillAddr?: {
        Line1?: string;
        City?: string;
        CountrySubDivisionCode?: string;
        PostalCode?: string;
    };
}

/**
 * Sync a CRM customer to QuickBooks
 * Creates a new QB customer if none exists, or finds existing by email
 */
export async function syncCustomerToQB(customerId: string): Promise<string | null> {
    // Get the CRM customer
    const customer = await db.customer.findUnique({
        where: { id: customerId },
    });

    if (!customer) {
        console.error('[QB Customer Sync] Customer not found:', customerId);
        return null;
    }

    const businessId = customer.businessId;

    const connection = await getQBConnection(businessId);
    if (!connection) {
        console.log(`[QB Customer Sync] No active QB connection for business ${businessId}, skipping sync`);
        return null;
    }

    // If already synced, return existing QB ID
    if (customer.qbCustomerId) {
        console.log(`[QB Customer Sync] Customer ${customer.name} already synced (QB ID: ${customer.qbCustomerId})`);
        return customer.qbCustomerId;
    }

    try {
        // First, try to find existing customer by email in QuickBooks
        const searchResult = await qbApiRequest(
            'GET',
            `query?query=SELECT * FROM Customer WHERE PrimaryEmailAddr = '${customer.email}'`,
            connection.realmId,
            connection.accessToken
        );

        let qbCustomerId: string;

        if (searchResult?.QueryResponse?.Customer?.length > 0) {
            // Customer exists in QB, use their ID
            qbCustomerId = searchResult.QueryResponse.Customer[0].Id;
            console.log(`[QB Customer Sync] Found existing QB customer: ${qbCustomerId}`);
        } else {
            // Create new customer in QuickBooks
            const qbCustomer: QBCustomerData = {
                DisplayName: customer.name,
            };

            if (customer.email) {
                qbCustomer.PrimaryEmailAddr = { Address: customer.email };
            }
            if (customer.phone) {
                qbCustomer.PrimaryPhone = { FreeFormNumber: customer.phone };
            }
            if (customer.address || customer.city || customer.state || customer.zip) {
                qbCustomer.BillAddr = {
                    Line1: customer.address || undefined,
                    City: customer.city || undefined,
                    CountrySubDivisionCode: customer.state || undefined,
                    PostalCode: customer.zip || undefined,
                };
            }

            const createResult = await qbApiRequest(
                'POST',
                'customer',
                connection.realmId,
                connection.accessToken,
                qbCustomer
            );

            qbCustomerId = createResult?.Customer?.Id;
            if (!qbCustomerId) {
                console.error('[QB Customer Sync] No customer ID returned from QB:', createResult);
                return null;
            }
            console.log(`[QB Customer Sync] Created new QB customer: ${qbCustomerId}`);
        }

        // Store the QB Customer ID in our database
        await db.customer.update({
            where: { id: customerId },
            data: { qbCustomerId },
        });

        return qbCustomerId;
    } catch (error) {
        console.error('[QB Customer Sync] Sync failed:', error);
        return null;
    }
}

/**
 * Batch sync all customers for a specific business that haven't been synced yet
 */
export async function syncAllCustomersToQB(businessId: string): Promise<{ synced: number; failed: number }> {
    const connection = await getQBConnection(businessId);
    if (!connection) return { synced: 0, failed: 0 };

    const unsyncedCustomers = await db.customer.findMany({
        where: { 
            businessId,
            qbCustomerId: null 
        },
    });

    let synced = 0;
    let failed = 0;

    for (const customer of unsyncedCustomers) {
        const result = await syncCustomerToQB(customer.id);
        if (result) {
            synced++;
        } else {
            failed++;
        }
    }

    return { synced, failed };
}
