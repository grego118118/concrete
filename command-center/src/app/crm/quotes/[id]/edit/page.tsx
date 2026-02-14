import { getQuote } from "@/app/actions/quotes";
import { getCustomersForSelect } from "@/app/actions/jobs";
import { redirect } from "next/navigation";
import CreateQuoteForm from "../../create/quote-form";

export default async function EditQuotePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const quote = await getQuote(params.id);

    if (!quote) {
        redirect("/crm/quotes");
    }

    // Fetch customers for the dropdown
    const customers = await getCustomersForSelect();

    return (
        <CreateQuoteForm
            customers={customers}
            initialData={{
                id: quote.id,
                customerId: quote.customerId,
                // Cast or map items to match form expectation
                items: quote.items.map((item: any) => ({
                    description: item.description,
                    quantity: item.quantity,
                    unitPrice: Number(item.unitPrice),
                    // We don't have unit in DB yet, so form will default
                })),
                status: quote.status,
                cleanupFee: quote.cleanupFee ? Number(quote.cleanupFee) : undefined,
                notes: quote.notes || undefined
            }}
        />
    );
}
