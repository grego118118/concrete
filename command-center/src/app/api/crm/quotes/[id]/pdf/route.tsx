import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { generateQuotePDF } from "@/lib/pdf-generator";

export async function GET(
    request: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;

    try {
        const quote = await db.quote.findUnique({
            where: { id: params.id },
            include: {
                customer: true,
                items: true,
            },
        });

        if (!quote) {
            return new NextResponse("Quote not found", { status: 404 });
        }

        const pdfBuffer = await generateQuotePDF(quote);

        return new NextResponse(pdfBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="Quote-${quote.number}.pdf"`,
            },
        });
    } catch (error) {
        console.error("[QUOTE_PDF]", error);
        return new NextResponse("Internal PDF Generation Error", { status: 500 });
    }
}
