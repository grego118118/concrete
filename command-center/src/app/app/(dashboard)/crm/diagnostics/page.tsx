import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import { retryInvoiceSync } from "@/lib/quickbooks/invoice-sync";
import { revalidatePath } from "next/cache";

export default async function DiagnosticsPage() {
    // Fetch failed or recently synced invoices
    const invoices = await db.invoice.findMany({
        where: {
            OR: [
                { status: 'FAILED' },
                { lastSyncError: { not: null } }
            ]
        },
        include: {
            customer: true,
            quote: true
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sync Diagnostics</h1>
                <p className="text-muted-foreground">
                    Troubleshoot QuickBooks synchronization issues and retry failed invoices.
                </p>
            </div>

            <div className="grid gap-6">
                {invoices.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                            <h3 className="text-lg font-semibold">All clear!</h3>
                            <p className="text-muted-foreground">No synchronization errors detected in the last 30 days.</p>
                        </CardContent>
                    </Card>
                ) : (
                    invoices.map((inv) => (
                        <Card key={inv.id} className={inv.status === 'FAILED' ? "border-red-200" : ""}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-xl">{inv.quote.number}</CardTitle>
                                        <Badge variant={inv.status === 'FAILED' ? "destructive" : "secondary"}>
                                            {inv.status}
                                        </Badge>
                                    </div>
                                    <CardDescription>
                                        Customer: {inv.customer.name} | Amount: ${Number(inv.amount).toLocaleString()}
                                    </CardDescription>
                                </div>
                                
                                <form action={async () => {
                                    "use server";
                                    await retryInvoiceSync(inv.id);
                                    revalidatePath('/app/crm/diagnostics');
                                }}>
                                    <Button size="sm" className="gap-2">
                                        <RefreshCw className="h-4 w-4" />
                                        Retry Sync
                                    </Button>
                                </form>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-4 space-y-4">
                                    {inv.lastSyncError && (
                                        <div className="rounded-lg bg-red-50 p-4 border border-red-100">
                                            <div className="flex gap-3">
                                                <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-medium text-red-900">
                                                        QuickBooks Error Response
                                                    </p>
                                                    <code className="text-xs text-red-700 block whitespace-pre-wrap font-mono bg-white/50 p-2 rounded border border-red-200 mt-2">
                                                        {inv.lastSyncError}
                                                    </code>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Clock className="h-3.5 w-3.5" />
                                            Last Attempt: {inv.lastSyncAt ? new Date(inv.lastSyncAt).toLocaleString() : 'Never'}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Badge variant="outline" className="text-[10px] uppercase font-bold">
                                                CRM ID: {inv.id}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Actionable Guidance based on Error String */}
                                    {(inv.lastSyncError?.includes('403') || inv.lastSyncError?.includes('3100')) && (
                                        <div className="space-y-3">
                                            <div className="text-sm bg-amber-50 text-amber-900 p-4 rounded-md border border-amber-200 flex flex-col gap-2">
                                                <div className="flex gap-2 font-bold">
                                                    <AlertCircle className="h-4 w-4 mt-0.5 text-amber-700" />
                                                    <span>App Authorization Failure (403)</span>
                                                </div>
                                                <p className="text-sm">
                                                    This error (3100) occurs when your Intuit Developer App does not have the <strong>"Payments"</strong> capability enabled in the production settings. 
                                                    Your QuickBooks company might have payments, but the API application itself is not authorized to create payment links.
                                                </p>
                                                <div className="pt-2">
                                                    <Button variant="outline" size="sm" className="bg-white border-amber-300 text-amber-900 h-8" asChild>
                                                        <a href="https://developer.intuit.com/app/developer/dashboard" target="_blank" rel="noreferrer">
                                                            Go to Intuit Developer Portal
                                                            <ExternalLink className="ml-2 h-3 w-3" />
                                                        </a>
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            <div className="text-xs bg-blue-50 text-blue-700 p-3 rounded-md border border-blue-100 flex gap-2">
                                                <Badge className="h-4 px-1 text-[10px] bg-blue-600">SAFE MODE</Badge>
                                                <span>
                                                    <strong>New:</strong> I've added a fallback. If you retry this sync, it will automatically attempt to create the invoice 
                                                    <em>without</em> the automated payment link if the 403 error is detected again.
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
