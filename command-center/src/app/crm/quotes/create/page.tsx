import { getCustomersForSelect } from "@/app/actions/jobs";
import CreateQuoteForm from "./quote-form";

export default async function CreateQuotePage() {
    // Reuse the customer fetcher from jobs since logic is finding customers
    const customers = await getCustomersForSelect();

    return <CreateQuoteForm customers={customers} />;
}
