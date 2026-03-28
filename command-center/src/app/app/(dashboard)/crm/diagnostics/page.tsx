import { db } from "@/lib/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, RefreshCw, CheckCircle2, XCircle, Clock, ExternalLink, ShieldCheck, ShieldAlert } from "lucide-react";
import { retryInvoiceSync } from "@/lib/quickbooks/invoice-sync";
import { revalidatePath } from "next/cache";

export default async function DiagnosticsPage() {
    // Fetch failed or recently synced invoices with notes
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
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Sync Diagnostics</h1>
                    <p className="text-muted-foreground">
                        Troubleshoot QuickBooks synchronization issues and verify automated fallbacks.
                    </p>
                </div>
            </div>

            <div className="grid gap-6">
                {invoices.length === 0 ? (
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                            <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                            <h3 className="text-lg font-semibold">System Healthy</h3>
                            <p className="text-muted-foreground">No synchronization errors or partial successes detected recently.</p>
                        </CardContent>
                    </Card>
                ) : (
                    invoices.map((inv) => {
                        const isPartialSuccess = inv.lastSyncError?.includes('successful in');
                        const isSafeMode = inv.lastSyncError?.includes('Safe Mode');
                        const isMinimalist = inv.lastSyncError?.includes('Minimalist Mode');
                        const isAuthError = inv.lastSyncError?.includes('403') || inv.lastSyncError?.includes('3100');

                        return (
                            <Card key={inv.id} className={inv.status === 'FAILED' ? "border-red-200" : isPartialSuccess ? "border-blue-200" : ""}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <CardTitle className="text-xl">{inv.quote.number}</CardTitle>
                                            <Badge 
                                                variant={inv.status === 'FAILED' ? "destructive" : isPartialSuccess ? "secondary" : "default"}
                                                className={isPartialSuccess ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200" : ""}
                                            >
                                                {isPartialSuccess ? "PARTIALLY SYNCED" : inv.status}
                                            </Badge>
                                            {isPartialSuccess && (
                                                <Badge variant="outline" className="border-blue-300 text-blue-600 gap-1">
                                                    <ShieldCheck className="h-3 w-3" />
                                                    Fallback Active
                                                </Badge>
                                            )}
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
                                        <Button size="sm" className="gap-2" variant={isPartialSuccess ? "outline" : "default"}>
                                            <RefreshCw className="h-4 w-4" />
                                            {isPartialSuccess ? "Retry Full Sync" : "Retry Sync"}
                                        </Button>
                                    </form>
                                </CardHeader>
                                <CardContent>
                                    <div className="mt-4 space-y-4">
                                        {/* Status / Error Box */}
                                        <div className={`rounded-lg p-4 border ${
                                            isPartialSuccess 
                                                ? "bg-blue-50 border-blue-100" 
                                                : "bg-red-50 border-red-100"
                                        }`}>
                                            <div className="flex gap-3">
                                                {isPartialSuccess ? (
                                                    <ShieldCheck className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                                                ) : (
                                                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                                                )}
                                                <div className="space-y-1">
                                                    <p className={`text-sm font-medium ${isPartialSuccess ? "text-blue-900" : "text-red-900"}`}>
                                                        {isPartialSuccess ? "Sync Status Note" : "QuickBooks Error Response"}
                                                    </p>
                                                    <p className={`text-sm ${isPartialSuccess ? "text-blue-700" : "text-red-700"} whitespace-pre-wrap font-medium mt-1`}>
                                                        {inv.lastSyncError}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="h-3.5 w-3.5" />
                                                Last Attempt: {inv.lastSyncAt ? new Date(inv.lastSyncAt).toLocaleString() : 'Never'}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Badge variant="outline" className="text-[10px] uppercase font-bold">
                                                    INTERNAL ID: {inv.id.slice(-8).toUpperCase()}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Guidance for Failures */}
                                        {isAuthError && !isPartialSuccess && (
                                            <div className="space-y-3 pt-2">
                                                <div className="text-sm bg-amber-50 text-amber-900 p-4 rounded-md border border-amber-200 flex flex-col gap-2 shadow-sm">
                                                    <div className="flex gap-2 font-bold">
                                                        <ShieldAlert className="h-4 w-4 mt-0.5 text-amber-700" />
                                                        <span>Application Authorization Failed (403)</span>
                                                    </div>
                                                    <p className="text-sm opacity-90">
                                                        This error (3100) indicates your Intuit App is restricted. This usually means the **Payments** setting isn't enabled in your "Production" dashboard settings.
                                                    </p>
                                                    <div className="pt-2 flex gap-3">
                                                        <Button variant="outline" size="sm" className="bg-white border-amber-300 text-amber-900 h-8" asChild>
                                                            <a href="https://developer.intuit.com/app/developer/dashboard" target="_blank" rel="noreferrer">
                                                                Fix in Intuit Dashboard
                                                                <ExternalLink className="ml-2 h-3 w-3" />
                                                            </a>
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* Encouragement for Partial Success */}
                                        {isPartialSuccess && (
                                            <div className="text-xs text-blue-600/80 italic border-t border-blue-100 pt-3">
                                                Note: While the invoice was created in QuickBooks, automated payment links are currently restricted. Once you fix the portal settings, retrying will update the invoice with a payment link.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>
        </div>
    );
}
