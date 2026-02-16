import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, FileText } from "lucide-react";
import Link from "next/link";

import { getQuotes, deleteQuote } from "@/app/actions/quotes";
import { DeleteActionButton } from "@/components/crm/delete-action-button";
export const dynamic = "force-dynamic";

export default async function QuotesPage() {
    const quotes = await getQuotes();
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Quotes & Invoices</h1>
                    <p className="text-muted-foreground">Manage proposals and billing.</p>
                </div>
                <Link href="/app/crm/quotes/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Quote
                    </Button>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search quotes..."
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
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {quotes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                    No quotes found. Create one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            quotes.map((quote) => (
                                <TableRow key={quote.id}>
                                    <TableCell className="font-mono flex items-center gap-2">
                                        <FileText className="h-3 w-3" />
                                        {quote.id.slice(-6).toUpperCase()}
                                    </TableCell>
                                    <TableCell className="font-medium">{quote.customer ? quote.customer.name : 'Unknown'}</TableCell>
                                    <TableCell>{new Date(quote.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>${Number(quote.total).toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="text-orange-600 border-orange-600">{quote.status}</Badge>
                                    </TableCell>
                                    <TableCell className="text-right flex justify-end gap-2">
                                        <Link href={`/app/crm/quotes/${quote.id}`}>
                                            <Button variant="ghost" size="sm">View</Button>
                                        </Link>
                                        <Link href={`/app/crm/quotes/${quote.id}/edit`}>
                                            <Button variant="ghost" size="sm">Manage</Button>
                                        </Link>
                                        <DeleteActionButton
                                            id={quote.id}
                                            onDelete={deleteQuote}
                                            entityName="Quote"
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
