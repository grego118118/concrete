import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getInvoice, updateInvoice } from "@/app/actions/invoices";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SendInvoiceButton } from "../send-invoice-button";

export default async function EditInvoicePage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const invoice = await getInvoice(params.id);

    if (!invoice) {
        redirect("/crm/invoices");
    }

    const updateInvoiceWithId = updateInvoice.bind(null, invoice.id);

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Manage Invoice</h1>
                <p className="text-muted-foreground">Update payment status for {invoice.number}.</p>
            </div>

            <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                    <span className="font-semibold">Customer:</span>
                    <span>{invoice.customer.name}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold">Amount Due:</span>
                    <span>${Number(invoice.amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                    <span className="font-semibold">Due Date:</span>
                    <span>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>

            <form action={updateInvoiceWithId} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="status">Payment Status</Label>
                    <Select name="status" defaultValue={invoice.status}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="PENDING">Pending</SelectItem>
                            <SelectItem value="SENT">Sent</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="OVERDUE">Overdue</SelectItem>
                            <SelectItem value="FAILED">Failed</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex justify-end gap-4">
                    <SendInvoiceButton invoiceId={invoice.id} currentStatus={invoice.status} />
                    <Link href="/crm/invoices">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit">Update Status</Button>
                </div>
            </form>
        </div>
    );
}

