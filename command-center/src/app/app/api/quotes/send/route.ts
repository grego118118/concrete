
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { processSendQuote } from "@/lib/tasks/send-quote";

export async function POST(req: Request) {
    try {
        const { quoteId } = await req.json();

        if (!quoteId) {
            return NextResponse.json({ error: "Missing quoteId" }, { status: 400 });
        }

        const taskName = `Send Quote: ${quoteId}`;

        // Create SyncLog entry
        const log = await db.syncLog.create({
            data: {
                taskName,
                status: "RUNNING",
                errorMessage: "Sending email...",
            },
        });

        // Trigger background task (Floating Promise)
        processSendQuote(quoteId, log.id);

        // Return immediate success
        return NextResponse.json({ success: true, taskName });

    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
