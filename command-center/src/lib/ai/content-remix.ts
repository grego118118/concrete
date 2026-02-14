import { anthropic } from "@ai-sdk/anthropic";
import { generateObject } from "ai";
import { z } from "zod";

// Schema for platform-specific content
export const SocialContentSchema = z.object({
    gbp: z.string().describe("Google Business Profile post. Professional, SEO-focused, includes update type."),
    facebook: z.string().describe("Facebook post. Engaging, community-focused, moderate length."),
    instagram: z.string().describe("Instagram caption. Visual-focused, heavy emoji use, many hashtags."),
    linkedin: z.string().describe("LinkedIn post. Professional, industry-focused, business value highlighted."),
    blog: z.object({
        title: z.string().describe("Catchy, SEO-optimized blog title."),
        excerpt: z.string().describe("A 2-sentence summary for the blog listing page."),
        content: z.string().describe("The full blog post in HTML format. Use <h2> for subheaders, <p> for paragraphs, and <ul>/<li> for lists. Do not use <html> or <body> tags."),
        metaDescription: z.string().describe("SEO meta description (max 160 chars).")
    }).describe("A full blog post based on the job context.")
});

export async function remixContent(baseContext: string, imageDescription?: string) {
    // Using Anthropic Claude 3.5 Sonnet for superior creative writing
    const model = anthropic("claude-3-5-sonnet-20240620");

    const { object } = await generateObject({
        model,
        schema: SocialContentSchema,
        system: `You are an expert social media and content manager for a local service business (Concrete Coatings).
    Your goal is to take a job description or photo context and create optimized posts for every platform, including a full blog post.
    
    Brand Voice: Professional, Reliable, High-Quality, Local.
    
    Rules for Social:
    - GBP: Focus on "Service Updates" or "Offers". strict SEO keywords (e.g. "Concrete in Springfield").
    - Instagram: Use 15-20 relevant hashtags.
    - Facebook: Ask a question to drive engagement.
    - LinkedIn: Focus on property value and durability.
    
    Rules for Blog:
    - Length: 500-800 words.
    - Structure: Engaging intro, 3-4 subheaders focusing on benefits/process, and a clear Call to Action.
    - SEO: Naturally include location-based keywords and service terms (polyaspartic, epoxy, garage floor).`,
        prompt: `Context: ${baseContext}\nImage Details: ${imageDescription || "No specific image details provided."}`
    });

    return object;
}

