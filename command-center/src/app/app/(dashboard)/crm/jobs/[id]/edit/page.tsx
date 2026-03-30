"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getJob, updateJob } from "@/app/actions/jobs";
import Link from "next/link";
import { DeleteJobButton } from "./delete-job-button";
import { Plus, Trash2 } from "lucide-react";

type OverageItem = {
    description: string;
    quantity: number;
    unitPrice: number;
};

export default function EditJobPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    const [job, setJob] = useState<any>(null);
    const [status, setStatus] = useState("");
    const [overageItems, setOverageItems] = useState<OverageItem[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        getJob(params.id).then((j) => {
            if (!j) { router.push("/app/crm/jobs"); return; }
            setJob(j);
            setStatus(j.status);
        });
    }, [params.id]);

    if (!job) return null;

    const allowOverages = job.quote?.allowOverages ?? false;
    const showOverages = status === "COMPLETED" && allowOverages;

    const addOverageItem = () => {
        setOverageItems(prev => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
    };

    const removeOverageItem = (index: number) => {
        setOverageItems(prev => prev.filter((_, i) => i !== index));
    };

    const updateOverageItem = (index: number, field: keyof OverageItem, value: string | number) => {
        setOverageItems(prev => prev.map((item, i) =>
            i === index ? { ...item, [field]: value } : item
        ));
    };

    const overageTotal = overageItems.reduce(
        (sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        const formData = new FormData(e.currentTarget);
        formData.set("status", status);
        if (showOverages && overageItems.length > 0) {
            formData.set("overageItems", JSON.stringify(overageItems));
        }
        await updateJob(job.id, formData);
        setIsSubmitting(false);
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Edit Job</h1>
                <p className="text-muted-foreground">Update job details for {job.customer.name}.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input id="title" name="title" defaultValue={job.title} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input
                        id="scheduledDate"
                        name="scheduledDate"
                        type="date"
                        defaultValue={job.scheduledAt ? new Date(job.scheduledAt).toISOString().split('T')[0] : ''}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Overage line items — only shown when COMPLETED and quote has allowOverages */}
                {showOverages && (
                    <Card className="border-amber-200 bg-amber-50/50">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base text-amber-900">Overage Line Items</CardTitle>
                            <p className="text-xs text-amber-700">
                                These will be added to the final balance invoice sent to the customer.
                            </p>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {overageItems.length === 0 && (
                                <p className="text-xs text-muted-foreground italic text-center py-2">
                                    No overages — only the remaining balance will be invoiced.
                                </p>
                            )}
                            {overageItems.map((item, index) => (
                                <div key={index} className="grid grid-cols-12 gap-2 items-end">
                                    <div className="col-span-5 space-y-1">
                                        {index === 0 && <Label className="text-xs">Description</Label>}
                                        <Input
                                            placeholder="Extra materials..."
                                            value={item.description}
                                            onChange={e => updateOverageItem(index, "description", e.target.value)}
                                        />
                                    </div>
                                    <div className="col-span-2 space-y-1">
                                        {index === 0 && <Label className="text-xs">Qty</Label>}
                                        <Input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={e => updateOverageItem(index, "quantity", Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-3 space-y-1">
                                        {index === 0 && <Label className="text-xs">Unit Price ($)</Label>}
                                        <Input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            value={item.unitPrice}
                                            onChange={e => updateOverageItem(index, "unitPrice", Number(e.target.value))}
                                        />
                                    </div>
                                    <div className="col-span-2 flex justify-end">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => removeOverageItem(index)}
                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}

                            <Button type="button" variant="outline" size="sm" onClick={addOverageItem} className="w-full border-dashed">
                                <Plus className="h-4 w-4 mr-2" />
                                Add Overage Item
                            </Button>

                            {overageItems.length > 0 && (
                                <div className="flex justify-end pt-2 border-t border-amber-200">
                                    <span className="text-sm font-semibold text-amber-900">
                                        Overage Total: ${overageTotal.toFixed(2)}
                                    </span>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={job.description || ''} />
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                    <DeleteJobButton jobId={job.id} />
                    <div className="flex gap-4">
                        <Link href="/app/crm/jobs">
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
