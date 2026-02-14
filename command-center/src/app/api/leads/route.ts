import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Handle Formspree webhook structure
        // Formspree sends data in a "form_data" object
        const data = body.form_data || body;

        const { name, email, phone, address, notes, square_footage, project_type, floor_condition, desired_finish, project_timeline } = data;

        // Validate required fields
        if (!name || !email) {
            return new NextResponse("Missing required fields", { status: 400 });
        }

        // For now, we'll assign leads to the first business found
        // In a multi-tenant app, this would need a way to identify the business (e.g. API key or hidden field)
        const business = await db.business.findFirst();

        if (!business) {
            console.error("No business found in database");
            return new NextResponse("Internal Server Error: No business configured", { status: 500 });
        }

        // Combine extra fields into notes if not in Customer model yet
        const enrichedNotes = `
Project Type: ${project_type || 'N/A'}
Square Footage: ${square_footage || 'N/A'}
Condition: ${floor_condition || 'N/A'}
Finish: ${desired_finish || 'N/A'}
Timeline: ${project_timeline || 'N/A'}

User Notes:
${notes || ''}
    `.trim();

        // Create the customer
        const customer = await db.customer.create({
            data: {
                name,
                email,
                phone: phone || null,
                address: address || null,
                notes: enrichedNotes,
                leadSource: "WEBSITE", // Tag as website lead
                businessId: business.id
            },
        });

        // CORS headers for local dev allow any origin
        const headers = {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        };

        return NextResponse.json(customer, { status: 201, headers });
    } catch (error) {
        console.error("[LEADS_POST]", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function OPTIONS(req: Request) {
    const headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    };
    return new NextResponse(null, { status: 200, headers });
}
