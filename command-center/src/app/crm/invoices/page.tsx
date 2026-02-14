import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, DollarSign } from "lucide-react";
import Link from "next/link";

import { getInvoices, deleteInvoice } from "@/app/actions/invoices";
import { DeleteActionButton } from "@/components/crm/delete-action-button";

export default async function InvoicesPage() {
    const invoices = await getInvoices();
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
                    <p className="text-muted-foreground">Track payments and revenue.</p>
                </div>
                {/* 
                <Link href="/crm/invoices/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Invoice
                    </Button>
                </Link>
                */}
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search invoices..."
                        className="pl-8"
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Number</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No invoices found. Generate one from a quote.
                                </TableCell>
                            </TableRow>
                        ) : (
                            invoices.map((invoice) => (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-mono flex items-center gap-2">
                                        <DollarSign className="h-3 w-3" />
                                        {invoice.number}
                                    </TableCell>
                                    <TableCell className="font-medium">{invoice.customer.name}</TableCell>
                                    <TableCell>{invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</TableCell>
                                    <TableCell>${Number(invoice.amount).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={invoice.status === 'PAID' ? 'default' : 'secondary'} className={invoice.status === 'PAID' ? 'bg-green-600' : ''}>
                                            {invoice.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-2">
                                        <Link href={`/app/crm/invoices/${invoice.id}/edit`}>
                                            <Button variant="ghost" size="sm">Manage</Button>
                                        </Link>
                                        <DeleteActionButton
                                            id={invoice.id}
                                            onDelete={deleteInvoice}
                                            entityName="Invoice"
                                        />
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
