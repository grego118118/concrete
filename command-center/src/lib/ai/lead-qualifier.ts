import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

// Schema for the qualified lead output
export const LeadQualificationSchema = z.object({
    score: z.number().min(0).max(100).describe("Qualification score from 0-100"),
    summary: z.string().describe("Brief summary of the lead's needs"),
    projectType: z.enum(["GARAGE", "PATIO", "BASEMENT", "COMMERCIAL", "OTHER"]).describe("Type of concrete project"),
    budget: z.string().optional().describe("Estimated budget if mentioned"),
    timeline: z.string().optional().describe("Desired timeline"),
    redFlags: z.array(z.string()).optional().describe("Any potential issues or dealbreakers"),
    suggestedNextStep: z.string().describe("Recommended action (e.g. Schedule Call, Site Visit, Archive)")
});

export async function qualifyLead(conversationHistory: { role: "user" | "assistant", content: string }[]) {
    const model = openai("gpt-4o");

    const { object } = await generateObject({
        model,
        schema: LeadQualificationSchema,
        system: `You are an expert concrete coating sales assistant. 
    Analyze the conversation to qualify the lead. 
    Focus on:
    1. Project Scope (Size, Condition of concrete)
    2. Timeline urgency
    3. Budget awareness
    
    Concrete Niche Knowledge:
    - Moisture issues are a red flag for basements.
    - New concrete needs 28 days to cure.
    - Cracks need repair.`,
        messages: conversationHistory,
    });

    return object;
}
