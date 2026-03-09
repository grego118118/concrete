import { getQuote } from "@/app/actions/quotes";
import { getCustomersForSelect } from "@/app/actions/jobs";
import { redirect } from "next/navigation";
import CreateQuoteForm from "../../create/quote-form";

export default async function EditQuotePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const quote = await getQuote(params.id);
    console.log(`[EditQuotePage] Loading quote: ${params.id}, Found: ${!!quote}`);

    if (!quote) {
        redirect("/app/crm/quotes");
    }

    // Fetch customers for the dropdown
    const customers = await getCustomersForSelect();

    const scopeData = quote.scopeData as any;

    return (
        <CreateQuoteForm
            customers={customers}
            initialData={{
                id: quote.id,
                customerId: quote.customerId,
                items: quote.items.map((item: any) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice),
                })),
                status: quote.status,
                cleanupFee: quote.cleanupFee ? Number(quote.cleanupFee) : undefined,
                notes: quote.notes || undefined,
                scopeArea: Number(quote.scopeArea || 0),
                baseRate: Number(scopeData?.baseRate || 12),
                scopeData: quote.scopeData
            }}
        />
    );
}
