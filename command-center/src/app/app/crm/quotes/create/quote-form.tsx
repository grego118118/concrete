"use client"

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Save } from "lucide-react";
import { createQuote, updateQuoteDetails } from "@/app/actions/quotes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { JobAreaCalculator } from "@/components/crm/job-area-calculator";
import { PhotoUploader } from "@/components/crm/photo-uploader";

type Customer = {
    id: string;
    name: string;
}

type InitialQuoteData = {
    id: string;
    customerId: string;
    items: {
        id?: number;
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    status?: string;
    cleanupFee?: number;
    notes?: string;
}

export default function CreateQuoteForm({ customers, initialData }: { customers: Customer[], initialData?: InitialQuoteData }) {
    const [items, setItems] = useState<any[]>([]);
    const [customerId, setCustomerId] = useState<string>("");
    const [cleanupFee, setCleanupFee] = useState<string>("");
    const [notes, setNotes] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    // Track scope data from the calculator
    const scopeRef = useRef<{ totalArea: number; baseRate: number; scopeData: any } | null>(null);

    useEffect(() => {
        if (initialData) {
            setCustomerId(initialData.customerId);
            if (initialData.items && initialData.items.length > 0) {
                setItems(initialData.items.map((item, index) => ({
                    id: index + 1,
                    description: item.description,
                    qty: item.quantity,
                    unit: "ea",
                    price: Number(item.unitPrice)
                })));
            }
            if (initialData.cleanupFee) setCleanupFee(initialData.cleanupFee.toString());
            if (initialData.notes) setNotes(initialData.notes);
        }
    }, [initialData]);

    const handleScopeChange = (data: { totalArea: number; baseRate: number; scopeData: any }) => {
        scopeRef.current = data;
    };

    const handleSubmit = async () => {
        if (!customerId) {
            toast.error("Please select a customer");
            return;
        }

        setIsSubmitting(true);
        try {
            const payload: any = {
                customerId,
                items: items.map(({ id, ...rest }) => rest),
                status: initialData ? initialData.status : "DRAFT",
                cleanupFee: cleanupFee ? parseFloat(cleanupFee) : undefined,
                notes: notes || undefined
            };

            // Include scope data from the calculator
            if (scopeRef.current) {
                payload.scopeArea = scopeRef.current.totalArea;
                payload.baseRate = scopeRef.current.baseRate;
                payload.scopeData = scopeRef.current.scopeData;
            }

            if (initialData) {
                await updateQuoteDetails(initialData.id, payload);
                toast.success("Quote updated successfully");
            } else {
                await createQuote(payload);
                toast.success("Quote created successfully");
            }
        } catch (error: any) {
            // Check both message and property commonly used by Next.js for redirects
            const isRedirect = error?.message === "NEXT_REDIRECT" || error?.digest?.startsWith("NEXT_REDIRECT");
            if (isRedirect) return;

            console.error("Failed to save quote:", error);
            toast.error("Failed to save quote. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">{initialData ? "Edit Quote" : "New Quote"}</h1>
                    <p className="text-slate-500 font-medium">{initialData ? `Update proposal #${initialData.id.slice(-6)}` : "Create a professional proposal for your customer."}</p>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Button onClick={handleSubmit} className="flex-1 md:flex-initial bg-slate-900 hover:bg-slate-800" disabled={isSubmitting}>
                        {initialData ? <Save className="mr-2 h-4 w-4" /> : <Send className="mr-2 h-4 w-4" />}
                        {initialData ? "Update Quote" : "Generate & Save"}
                    </Button>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-12 items-start">
                <div className="lg:col-span-8 space-y-8 order-2 lg:order-1">

                    {/* Planning Tools */}
                    <div className="space-y-6 py-6 pb-20">
                        <div className="flex items-center gap-2 px-1 border-b pb-4">
                            <div className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                            <h2 className="text-xl font-bold text-slate-900">Project Planning & Documentation</h2>
                        </div>

                        <JobAreaCalculator
                            quoteId={initialData?.id}
                            onScopeChange={handleScopeChange}
                        />

                        <div className="bg-white border-2 border-slate-100 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 bg-slate-900 border-b">
                                <p className="text-xs font-bold text-white uppercase tracking-widest">Site Photos (Before State)</p>
                            </div>
                            <div className="p-8">
                                <PhotoUploader quoteId={initialData?.id} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6 order-1 lg:order-2 lg:sticky lg:top-24">
                    <Card className="border-2 border-slate-100 shadow-sm overflow-hidden">
                        <CardHeader className="border-b bg-slate-50/50">
                            <CardTitle className="text-lg">Customer Association</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="space-y-3">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bill To Customer</Label>
                                <Select onValueChange={setCustomerId} value={customerId}>
                                    <SelectTrigger className="h-12 border-slate-200 focus:ring-blue-500">
                                        <SelectValue placeholder="Search or select customer..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id} className="py-3">{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3 pt-4 border-t">
                                <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Additional Fees & Notes</Label>

                                <div className="space-y-2">
                                    <Label htmlFor="cleanupFee" className="text-sm font-medium text-slate-700">Clean Up Fee ($)</Label>
                                    <input
                                        type="number"
                                        id="cleanupFee"
                                        className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="0.00"
                                        min="0"
                                        step="0.01"
                                        value={cleanupFee}
                                        onChange={(e) => setCleanupFee(e.target.value)}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="notes" className="text-sm font-medium text-slate-700">Additional Comments</Label>
                                    <textarea
                                        id="notes"
                                        className="flex min-h-[80px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
                                        placeholder="Add any notes visible to the customer..."
                                        value={notes}
                                        onChange={(e) => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
