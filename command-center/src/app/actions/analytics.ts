"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

async function getBusinessId(): Promise<string | null> {
    const session = await auth();
    return (session?.user as any)?.businessId ?? null;
}

export async function saveAnalyticsSettings(data: {
    propertyId: string;
    clientEmail: string;
    privateKey: string;
}) {
    const businessId = await getBusinessId();
    if (!businessId) return { success: false, error: "Not authenticated" };

    try {
        const business = await db.business.findUnique({
            where: { id: businessId },
            select: { brandKit: true },
        });

        const existingKit = (business?.brandKit as Record<string, any>) ?? {};
        const updatedKit = {
            ...existingKit,
            analyticsSettings: {
                propertyId: data.propertyId,
                clientEmail: data.clientEmail,
                privateKey: data.privateKey,
            },
        };

        await db.business.update({
            where: { id: businessId },
            data: { brandKit: updatedKit },
        });

        revalidatePath("/app/crm/settings");
        revalidatePath("/app");
        return { success: true };
    } catch (error) {
        console.error("Error saving analytics settings:", error);
        return { success: false, error: "Failed to save settings" };
    }
}

export async function getAnalyticsSettings() {
    const businessId = await getBusinessId();
    if (!businessId) return { success: false, error: "Not authenticated", data: null };

    try {
        const business = await db.business.findUnique({
            where: { id: businessId },
            select: { brandKit: true },
        });

        const kit = (business?.brandKit as Record<string, any>) ?? {};
        const settings = kit.analyticsSettings ?? null;
        return { success: true, data: settings };
    } catch (error) {
        console.error("Error fetching analytics settings:", error);
        return { success: false, error: "Failed to fetch settings", data: null };
    }
}

export async function getWebsiteTraffic() {
    const settingsResult = await getAnalyticsSettings();
    if (!settingsResult.success || !settingsResult.data) {
        return { connected: false, data: null };
    }

    const { propertyId, clientEmail, privateKey } = settingsResult.data;
    if (!propertyId || !clientEmail || !privateKey) {
        return { connected: false, data: null };
    }

    try {
        const { google } = await import("googleapis");
        const analyticsdata = google.analyticsdata("v1beta");

        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: clientEmail,
                private_key: privateKey.replace(/\\n/g, "\n"),
            },
            scopes: ["https://www.googleapis.com/auth/analytics.readonly"],
        });

        const response = await analyticsdata.properties.runReport({
            property: `properties/${propertyId}`,
            auth,
            requestBody: {
                dateRanges: [{ startDate: "30daysAgo", endDate: "today" }],
                metrics: [
                    { name: "sessions" },
                    { name: "totalUsers" },
                    { name: "screenPageViews" },
                    { name: "bounceRate" },
                ],
            },
        });

        const row = response.data.rows?.[0]?.metricValues;
        if (!row) return { connected: true, data: null };

        return {
            connected: true,
            data: {
                sessions: parseInt(row[0]?.value ?? "0"),
                users: parseInt(row[1]?.value ?? "0"),
                pageViews: parseInt(row[2]?.value ?? "0"),
                bounceRate: parseFloat(row[3]?.value ?? "0"),
            },
        };
    } catch (error: any) {
        console.error("GA4 API error:", error?.message ?? error);
        return { connected: true, data: null, error: "Failed to fetch analytics data" };
    }
}
