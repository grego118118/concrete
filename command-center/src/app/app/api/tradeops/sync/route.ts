import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { runScraper } from "@/app/actions/leads";
import { fetchGA4 } from "@/lib/tasks/ga4";
import { postSocial } from "@/lib/tasks/social";

export async function POST() {
    console.log("[API] /api/tradeops/sync POST called");
    try {
        // 1. Check if ANY sync is already RUNNING (optional, but good for safety)
        const activeSync = await db.syncLog.findFirst({
            where: {
                taskName: "all-sync",
                status: "RUNNING",
                startedAt: { gt: new Date(Date.now() - 5 * 60 * 1000) } // Check for stale runs > 5 mins
            }
        });

        if (activeSync) {
            return NextResponse.json({ status: "ALREADY_RUNNING" }, { status: 409 });
        }

        // 2. Create new SyncLog entry
        const log = await db.syncLog.create({
            data: {
                taskName: "all-sync",
                status: "RUNNING",
                errorMessage: "Starting sync..."
            }
        });

        // 3. Trigger background tasks (fire and forget)
        (async () => {
            try {
                // Scraper
                await db.syncLog.update({
                    where: { id: log.id },
                    data: { errorMessage: "Running Scraper..." },
                });
                await runScraper();

                // GA4
                await db.syncLog.update({
                    where: { id: log.id },
                    data: { errorMessage: "Fetching GA4 Data..." },
                });
                await fetchGA4();

                // Social
                await db.syncLog.update({
                    where: { id: log.id },
                    data: { errorMessage: "Posting to Social Media..." },
                });
                await postSocial();

                // Complete
                await db.syncLog.update({
                    where: { id: log.id },
                    data: {
                        status: "COMPLETED",
                        errorMessage: "All systems synced.",
                        completedAt: new Date()
                    },
                });
            } catch (error: any) {
                console.error("Sync failed:", error);
                await db.syncLog.update({
                    where: { id: log.id },
                    data: {
                        status: "FAILED",
                        errorMessage: error.message || "Unknown error",
                        completedAt: new Date()
                    },
                });
            }
        })();

        // 4. Return immediate response
        return NextResponse.json({ status: "STARTED", logId: log.id });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET() {
    // Get the latest log entry for "all-sync"
    let latestLog = await db.syncLog.findFirst({
        where: { taskName: "all-sync" },
        orderBy: { startedAt: "desc" },
    });

    if (!latestLog) {
        return NextResponse.json({ status: "PENDING", errorMessage: "No sync run yet." });
    }

    // Check for stale running tasks (> 1 hour)
    if (latestLog.status === "RUNNING") {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        if (latestLog.startedAt < oneHourAgo) {
            // It's stale, mark as failed
            latestLog = await db.syncLog.update({
                where: { id: latestLog.id },
                data: {
                    status: "FAILED",
                    errorMessage: "Sync timed out (stale process).",
                    completedAt: new Date()
                }
            });
        }
    }

    return NextResponse.json(latestLog);
}
