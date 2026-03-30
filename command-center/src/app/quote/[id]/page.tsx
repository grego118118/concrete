import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { QuoteAcceptClient } from "./client";

export default async function PublicQuotePage(props: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ success?: string; canceled?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;

    const quote = await db.quote.findUnique({
        where: { id: params.id },
        include: {
            customer: true,
            items: true,
            invoice: true,
            photos: true,
        }
    });

    if (!quote) {
        notFound();
    }

    // Build line items from scope data
    const scopeData = quote.scopeData as any;
    const scopeArea = Number(quote.scopeArea) || 0;
    const baseRate = Number(scopeData?.baseRate) || 0;
    const customItems = (scopeData?.customItems || []) as Array<{ name: string; sqft: number; rate: number }>;

    const lineItems: { description: string; quantity: number; unitPrice: number; total: number }[] = [];

    if (scopeArea > 0 && baseRate > 0) {
        const prepType = scopeData?.prepType || "Standard Diamond Grind";
        const coatingType = scopeData?.coatingType || "Epoxy";
        const topCoatType = scopeData?.topCoatType || "";
        const flakeType = scopeData?.flakeType || "";
        const parts = [coatingType, topCoatType, flakeType].filter(Boolean).join(" + ");

        lineItems.push({
            description: `${parts || "Epoxy Floor Coating"} System — ${prepType}`,
            quantity: scopeArea,
            unitPrice: baseRate,
            total: scopeArea * baseRate,
        });

        for (const ci of customItems) {
            if (ci.name && ci.sqft > 0 && ci.rate > 0) {
                lineItems.push({
                    description: ci.name,
                    quantity: ci.sqft,
                    unitPrice: ci.rate,
                    total: ci.sqft * ci.rate,
                });
            }
        }
    }

    // Fall back to DB items
    const displayItems = lineItems.length > 0 ? lineItems : quote.items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
    }));

    const quoteTotal = Number(quote.total);
    const subtotal = Number(quote.subtotal);
    const tax = Number(quote.tax);
    const deposit = Number(quote.deposit) || quoteTotal * 0.5;

    const isAlreadyAccepted = quote.status === "APPROVED";
    const isSuccess = searchParams.success === "true";
    const isCanceled = searchParams.canceled === "true";

    return (
        <QuoteAcceptClient
            quoteId={quote.id}
            quoteNumber={quote.number}
            customer={{
                name: quote.customer.name,
                email: quote.customer.email,
                phone: quote.customer.phone,
                address: quote.customer.address,
                city: quote.customer.city,
                state: quote.customer.state,
                zip: quote.customer.zip,
            }}
            items={displayItems}
            subtotal={subtotal}
            discount={Number(quote.discount) || 0}
            discountRate={Number(scopeData?.discountRate) || 0}
            tax={tax}
            total={quoteTotal}
            deposit={deposit}
            isAlreadyAccepted={isAlreadyAccepted}
            isSuccess={isSuccess}
            isCanceled={isCanceled}
            cleanupFee={quote.cleanupFee ? Number(quote.cleanupFee) : undefined}
            notes={quote.notes || undefined}
            paymentLink={quote.invoice?.paymentLink || undefined}
            scopeData={scopeData}
            scopeArea={scopeArea}
            jobLocation={quote.jobLocation}
            createdAt={quote.createdAt.toISOString()}
            photos={(quote.photos || []).map((p: any) => ({ id: p.id, url: p.url, caption: p.caption }))}
        />
    );
}
