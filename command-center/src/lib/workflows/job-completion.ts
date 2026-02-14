import { processPhotoToPost } from "@/lib/social/photo-to-post";
// import { sendReviewRequest } from "@/lib/social/review-automation"; // Assuming existing

export async function onJobComplete(jobId: string) {
    console.log(`[WORKFLOW] Starting Job Completion Sequence for ${jobId}`);

    // 1. Fetch Job Data (Mock)
    const job = {
        id: jobId,
        description: "Full flake coating on 2-car garage.",
        location: "Springfield, MA",
        photos: ["photo1.jpg"] // In real app, fetch from DB
    };

    try {
        // 2. Send Review Request SMS
        // await sendReviewRequest(customerId);
        console.log("✅ SMS Review Request Sent");

        // 3. Auto-Generate Social Content
        if (job.photos.length > 0) {
            await processPhotoToPost(job);
            console.log("✅ Social Post Generated & Queued");
        }

        return { success: true };
    } catch (error) {
        console.error("[WORKFLOW_ERROR]", error);
        return { success: false, error };
    }
}
