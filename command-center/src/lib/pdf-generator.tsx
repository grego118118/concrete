import React from "react";
// import { renderToStream } from "@react-pdf/renderer";
// import { QuoteDocument } from "@/components/pdf/QuoteDocument";

export async function generateQuotePDF(quote: any) {
    const { renderToStream } = await import("@react-pdf/renderer");
    const { QuoteDocument } = await import("@/components/pdf/QuoteDocument");

    const stream = await renderToStream(
        <QuoteDocument
            quote={quote}
            customer={quote.customer}
            items={quote.items}
        />
    );

    // Convert Stream to Buffer
    const chunks: Buffer[] = [];
    // @ts-ignore
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

export async function generateInvoicePDF(invoice: any) {
    const { renderToStream } = await import("@react-pdf/renderer");
    const { InvoiceDocument } = await import("@/components/pdf/InvoiceDocument");

    // Get items from the linked quote if available
    const items = invoice.quote?.items || [];

    const stream = await renderToStream(
        <InvoiceDocument
            invoice={invoice}
            customer={invoice.customer}
            items={items}
        />
    );

    // Convert Stream to Buffer
    const chunks: Buffer[] = [];
    // @ts-ignore
    for await (const chunk of stream) {
        chunks.push(Buffer.from(chunk));
    }
    return Buffer.concat(chunks);
}

