import { remixContent } from "@/lib/ai/content-remix";

interface JobData {
    id: string;
    description: string;
    location: string;
    photos: string[];
}

export async function processPhotoToPost(jobData: JobData) {
    // 1. Generate Content
    const baseContext = `Completed job at ${jobData.location}. ${jobData.description}`;
    const content = await remixContent(baseContext, "Job site photo showing finished concrete floor.");

    // 2. Prepare Post Objects (Mock DB Call)
    const posts = [
        { platform: "GOOGLE_BUSINESS", content: content.gbp, scheduledFor: new Date() },
        { platform: "FACEBOOK", content: content.facebook, scheduledFor: new Date() },
        { platform: "INSTAGRAM", content: content.instagram, scheduledFor: new Date() },
        { platform: "LINKEDIN", content: content.linkedin, scheduledFor: new Date() }
    ];

    // 3. Save to Scheduled Posts (Mock)
    console.log("Created 4 scheduled posts for Job", jobData.id);

    return posts;
}
