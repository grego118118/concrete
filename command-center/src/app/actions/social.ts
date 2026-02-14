"use server"

import { db } from "@/lib/db";
import { Platform } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function upsertSocialConnection(data: {
    platform: Platform;
    isEnabled?: boolean;
    apiKey?: string;
    accessToken?: string;
    apiSecret?: string;
    refreshToken?: string;
    profileName?: string;
    profileId?: string;
    businessId: string;
}) {
    try {
        console.log(`Upserting social connection (Raw SQL) for business: ${data.businessId}, platform: ${data.platform}`);

        // 1. Check if business exists (Raw SQL)
        const businessResult = await db.$queryRaw`SELECT id FROM "Business" WHERE id = ${data.businessId} LIMIT 1`;
        if (Array.isArray(businessResult) && businessResult.length === 0) {
            console.error(`Business with ID ${data.businessId} not found.`);
            return { success: false, error: "Business not found. Please refresh." };
        }

        // 2. Upsert SocialConnection (Raw SQL)
        const id = Math.random().toString(36).substring(7); // Simple cuid-like for fallback if needed
        const isEnabled = data.isEnabled ?? true;
        const now = new Date();

        await db.$executeRaw`
            INSERT INTO "SocialConnection" (
                "id", "platform", "isEnabled", "apiKey", "accessToken", 
                "apiSecret", "refreshToken", "profileName", "profileId", 
                "businessId", "createdAt", "updatedAt"
            ) VALUES (
                ${id}, ${data.platform}::"Platform", ${isEnabled}, 
                ${data.apiKey || null}, ${data.accessToken || null}, 
                ${data.apiSecret || null}, ${data.refreshToken || null}, 
                ${data.profileName || null}, ${data.profileId || null}, 
                ${data.businessId}, ${now}, ${now}
            )
            ON CONFLICT ("businessId", "platform") DO UPDATE SET
                "isEnabled" = ${isEnabled},
                "apiKey" = COALESCE(EXCLUDED."apiKey", "SocialConnection"."apiKey"),
                "accessToken" = COALESCE(EXCLUDED."accessToken", "SocialConnection"."accessToken"),
                "apiSecret" = COALESCE(EXCLUDED."apiSecret", "SocialConnection"."apiSecret"),
                "refreshToken" = COALESCE(EXCLUDED."refreshToken", "SocialConnection"."refreshToken"),
                "profileName" = COALESCE(EXCLUDED."profileName", "SocialConnection"."profileName"),
                "profileId" = COALESCE(EXCLUDED."profileId", "SocialConnection"."profileId"),
                "updatedAt" = ${now}
        `;


        revalidatePath("/social/settings");
        return { success: true };
    } catch (error) {
        console.error("Error upserting social connection (Raw):", error);
        if (error instanceof Error) {
            console.error("Error Name:", error.name);
            console.error("Error Message:", error.message);
        }
        return { success: false, error: "Failed to update connection" };
    }
}


export async function getSocialConnections(businessId: string) {
    try {
        const connections = await db.$queryRaw`SELECT * FROM "SocialConnection" WHERE "businessId" = ${businessId}`;
        return { success: true, data: connections as any[] };
    } catch (error) {
        console.error("Error fetching social connections (Raw):", error);
        if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
        }
        return { success: false, error: "Failed to fetch connections" };
    }
}
