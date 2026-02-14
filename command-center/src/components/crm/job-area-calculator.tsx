"use client";

import { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Calculator, Save, Square, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateScopeData } from "@/app/actions/workflow";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

interface CalcItem {
    id: string;
    name: string;
    sqft: number;
    rate: number;
}

export function JobAreaCalculator({ jobId, quoteId, initialData, onScopeChange }: { jobId?: string, quoteId?: string, initialData?: any, onScopeChange?: (data: { totalArea: number; baseRate: number; scopeData: any }) => void }) {
    const [isSaving, setIsSaving] = useState(false);
    // Initialize state from initialData if available
    const [area, setArea] = useState<number>(initialData?.totalArea || 0);

    // Section states
    const [prepType, setPrepType] = useState(initialData?.scopeData?.prepType || "Standard Diamond Grind");
    const [coatingType, setCoatingType] = useState(initialData?.scopeData?.coatingType || "Epoxy Clear Base");
    const [topCoatType, setTopCoatType] = useState(initialData?.scopeData?.topCoatType || "Polyaspartic 85% Solids");
    const [flakeType, setFlakeType] = useState(initialData?.scopeData?.flakeType || "1/4 Signature Blend");
    const [comments, setComments] = useState(initialData?.scopeData?.comments || "");

    const [baseRate, setBaseRate] = useState<number>(initialData?.baseRate || 12);
    const [applyTax, setApplyTax] = useState<boolean>(initialData?.scopeData?.applyTax ?? true);
    const [jobsiteCleanup, setJobsiteCleanup] = useState<boolean>(initialData?.scopeData?.jobsiteCleanup ?? false);

    // Custom items
    const [customItems, setCustomItems] = useState<CalcItem[]>(initialData?.scopeData?.customItems || []);

    const addCustomItem = () => {
        setCustomItems([...customItems, { id: Date.now().toString(), name: "", sqft: area, rate: 0 }]);
    };

    const removeCustomItem = (id: string) => {
        setCustomItems(customItems.filter(item => item.id !== id));
    };

    const updateCustomItem = (id: string, field: keyof CalcItem, value: string | number) => {
        setCustomItems(customItems.map(item => item.id === id ? { ...item, [field]: value } : item));
    };

    const totalCost = useMemo(() => {
        let subtotal = area * baseRate;
        customItems.forEach(item => {
            subtotal += (item.sqft * item.rate);
        });

        if (jobsiteCleanup) {
            subtotal += 150; // Flat fee for cleanup
        }

        if (applyTax) {
            return subtotal * 1.0625; // 6.25% MA Tax
        }

        return subtotal;
    }, [area, baseRate, customItems, applyTax, jobsiteCleanup]);

    // Broadcast scope changes to parent form (for new quotes that don't have an ID yet)
    const getCurrentScopeData = () => ({
        totalArea: area,
        baseRate,
        scopeData: {
            prepType,
            coatingType,
            topCoatType,
            flakeType,
            customItems,
            comments,
            baseRate,
            applyTax,
            jobsiteCleanup
        }
    });

    // Notify parent whenever scope changes
    useEffect(() => {
        if (onScopeChange) {
            onScopeChange(getCurrentScopeData());
        }
    }, [area, baseRate, prepType, coatingType, topCoatType, flakeType, customItems, comments, applyTax, jobsiteCleanup]);

    const handleSave = async () => {
        const id = jobId || quoteId;

        // If no ID (new quote), just notify parent — the parent form will save it
        if (!id) {
            if (onScopeChange) {
                onScopeChange(getCurrentScopeData());
                toast.success("Scope data captured — click 'Generate & Save' to create your quote.");
            }
            return;
        }

        setIsSaving(true);
        try {
            await updateScopeData({
                id,
                type: jobId ? 'job' : 'quote',
                totalArea: area,
                baseRate: baseRate,
                scopeData: {
                    prepType,
                    coatingType,
                    topCoatType,
                    flakeType,
                    customItems,
                    comments,
                    baseRate,
                    applyTax,
                    jobsiteCleanup
                }
            });
            toast.success("Project scope updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update project scope");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Card className="border-2 border-slate-100 shadow-xl overflow-hidden">
            <CardHeader className="bg-slate-900 text-white py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-lg">
                            <Calculator className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-xl">Scope Calculator</CardTitle>
                            <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mt-1">Project Estimation Tool</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-xs text-slate-400 block mb-1">Estimated Value</span>
                        <span className="text-3xl font-black text-blue-400">${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="p-6 space-y-8">
                {/* Basic Dimensions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
                    <div className="space-y-3">
                        <Label htmlFor="total-area" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                            <Square className="h-4 w-4 text-blue-600" />
                            Total Area (SQ FT)
                        </Label>
                        <Input
                            id="total-area"
                            type="number"
                            placeholder="e.g. 450"
                            className="h-12 text-lg font-bold border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                            value={area || ""}
                            onChange={(e) => setArea(Number(e.target.value))}
                        />
                    </div>
                    <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between border border-blue-100 text-blue-900">
                        <div className="text-sm font-medium">Standard Pricing</div>
                        <div className="text-right flex items-center gap-2">
                            <span className="text-lg font-bold">$</span>
                            <Input
                                type="number"
                                className="w-16 h-8 text-right font-bold bg-white border-blue-200 focus:ring-blue-500"
                                value={baseRate}
                                onChange={(e) => setBaseRate(Number(e.target.value))}
                            />
                            <span className="text-sm font-bold">/ft²</span>
                        </div>
                    </div>
                </div>

                {/* Coating Selections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Prep Work Style</Label>
                        <Select value={prepType} onValueChange={setPrepType}>
                            <SelectTrigger className="h-11 border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Standard Diamond Grind">Standard Diamond Grind</SelectItem>
                                <SelectItem value="Heavy Shot Blast">Heavy Shot Blast</SelectItem>
                                <SelectItem value="Chemical Etch (Not Recommended)">Chemical Etch</SelectItem>
                                <SelectItem value="Patch/Crack Repair Only">Patch/Crack Repair Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Epoxy Base Coat</Label>
                        <Select value={coatingType} onValueChange={setCoatingType}>
                            <SelectTrigger className="h-11 border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Epoxy Clear Base">Epoxy Clear Base</SelectItem>
                                <SelectItem value="MVB Moisture Vapor Barrier">MVB Moisture Barrier</SelectItem>
                                <SelectItem value="Color Tinted Primer">Color Tinted Primer</SelectItem>
                                <SelectItem value="Fast Cure Epoxy">Fast Cure Epoxy</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Polyaspartic Top Coat</Label>
                        <Select value={topCoatType} onValueChange={setTopCoatType}>
                            <SelectTrigger className="h-11 border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Polyaspartic 85% Solids">Polyaspartic 85% Solids</SelectItem>
                                <SelectItem value="High-Gloss UV Resistant">High-Gloss UV Resistant</SelectItem>
                                <SelectItem value="Satin/Matte Finish">Satin/Matte Finish</SelectItem>
                                <SelectItem value="Slip-Resistant Texture">Slip-Resistant Texture</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Flake Broadcast</Label>
                        <Select value={flakeType} onValueChange={setFlakeType}>
                            <SelectTrigger className="h-11 border-slate-200">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1/4 Signature Blend">1/4" Signature Blend</SelectItem>
                                <SelectItem value="1/16 Micro Flake">1/16" Micro Flake</SelectItem>
                                <SelectItem value="Carbon/Metallic Pigment">Carbon/Metallic Pigment</SelectItem>
                                <SelectItem value="Solid Color Seeker">Solid Color Seeker</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Tax & Cleanup Toggle */}
                <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-bold text-slate-700">Massachusetts Sales Tax</Label>
                            <p className="text-[10px] text-slate-500 font-medium">Apply 6.25% state tax to quote</p>
                        </div>
                        <Switch
                            checked={applyTax}
                            onCheckedChange={setApplyTax}
                        />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-bold text-slate-700">Jobsite Clean Up</Label>
                            <p className="text-[10px] text-slate-500 font-medium">Add $150 professional cleanup fee</p>
                        </div>
                        <Switch
                            checked={jobsiteCleanup}
                            onCheckedChange={setJobsiteCleanup}
                        />
                    </div>
                </div>

                {/* Custom Items */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900">Additional Add-ons</h4>
                        <Button variant="ghost" size="sm" onClick={addCustomItem} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                            <Plus className="h-4 w-4 mr-1" /> Add Item
                        </Button>
                    </div>

                    <div className="space-y-3">
                        {customItems.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-3 items-end bg-slate-50/50 p-3 rounded-lg border border-slate-100">
                                <div className="col-span-6 space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Item Name</Label>
                                    <Input
                                        value={item.name}
                                        onChange={(e) => updateCustomItem(item.id, "name", e.target.value)}
                                        placeholder="e.g. Stem Wall Coating"
                                        className="h-9 text-sm bg-white"
                                    />
                                </div>
                                <div className="col-span-2 space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Sq Ft</Label>
                                    <Input
                                        type="number"
                                        value={item.sqft}
                                        onChange={(e) => updateCustomItem(item.id, "sqft", Number(e.target.value))}
                                        className="h-9 text-sm bg-white"
                                    />
                                </div>
                                <div className="col-span-3 space-y-1">
                                    <Label className="text-[10px] uppercase font-bold text-slate-400">$/SQFT</Label>
                                    <Input
                                        type="number"
                                        value={item.rate}
                                        onChange={(e) => updateCustomItem(item.id, "rate", Number(e.target.value))}
                                        placeholder="0.00"
                                        className="h-9 text-sm bg-white"
                                    />
                                </div>
                                <div className="col-span-1 pb-1">
                                    <Button variant="ghost" size="icon" onClick={() => removeCustomItem(item.id)} className="h-8 w-8 text-slate-400 hover:text-red-500">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comments */}
                <div className="space-y-3">
                    <Label htmlFor="comments" className="text-sm font-bold text-slate-900">Additional Project Comments</Label>
                    <Textarea
                        id="comments"
                        placeholder="Significant concrete spalling near garage door. Customer requested extra flake on the stairs..."
                        className="min-h-[100px] border-slate-200"
                        value={comments}
                        onChange={(e) => setComments(e.target.value)}
                    />
                </div>

                <div className="pt-4">
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || (!jobId && !quoteId)}
                        className="w-full h-14 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isSaving ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-5 w-5" />
                        )}
                        Update {quoteId ? 'Quote' : 'Job'} Scope & Estimates
                    </Button>
                    <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest mt-4 font-medium">Calculations are saved instantly to the {quoteId ? 'sales' : 'production'} log</p>
                </div>
            </CardContent>
        </Card >
    );
}
