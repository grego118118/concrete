"use server"

import { db } from "@/lib/db";
import { auth } from "@/auth";
import { Platform } from "@prisma/client";
import { revalidatePath } from "next/cache";

async function getBusinessId(): Promise<string | null> {
    const session = await auth();
    return (session?.user as any)?.businessId ?? null;
}

export async function upsertSocialConnection(data: {
    platform: Platform;
    isEnabled?: boolean;
    apiKey?: string;
    accessToken?: string;
    apiSecret?: string;
    refreshToken?: string;
    profileName?: string;
    profileId?: string;
}) {
    const businessId = await getBusinessId();
    if (!businessId) return { success: false, error: "Not authenticated" };

    try {
        const id = Math.random().toString(36).substring(7);
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
                ${businessId}, ${now}, ${now}
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

        revalidatePath("/app/social/settings");
        return { success: true };
    } catch (error) {
        console.error("Error upserting social connection:", error);
        return { success: false, error: "Failed to update connection" };
    }
}

export async function getSocialConnections() {
    const businessId = await getBusinessId();
    if (!businessId) return { success: false, error: "Not authenticated", data: [] };

    try {
        const connections = await db.$queryRaw`SELECT * FROM "SocialConnection" WHERE "businessId" = ${businessId}`;
        return { success: true, data: connections as any[] };
    } catch (error) {
        console.error("Error fetching social connections:", error);
        return { success: false, error: "Failed to fetch connections", data: [] };
    }
}
