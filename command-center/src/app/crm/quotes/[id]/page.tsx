import { Button } from "@/components/ui/button";
import { getQuote } from "@/app/actions/quotes";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Printer, Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { DeleteQuoteButton } from "./delete-button";
import { AcceptQuoteButton } from "./accept-button";
import { PhotoUploader } from "@/components/crm/photo-uploader";
import { JobAreaCalculator } from "@/components/crm/job-area-calculator";
import { ConvertQuoteButton } from "./convert-button";
import { PrintQuoteButton } from "./print-button";
import { DownloadQuoteButton } from "./download-button";
import { SendQuoteButton } from "./send-quote-button";

// Helper to get business info (mocked or real)
async function getBusinessProfile() {
    const business = await db.business.findFirst();
    if (business && business.name !== "TradeOps Demo") return business;
    return {
        name: "Pioneer Concrete Coatings",
        brandKit: {}
    };
}

export default async function QuoteViewPage(props: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ success?: string, canceled?: string }>
}) {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const quote = (await getQuote(params.id)) as any;
    const business = await getBusinessProfile();

    if (!quote) {
        redirect("/crm/quotes");
    }

    const { customer, items } = quote;

    // Use local logo path
    const logoUrl = "/assets/images/logo-new.png";

    // UI details
    const businessAddress = "Serving Southern New England";
    const businessPhone = "(413) 544-4933";
    const businessEmail = "quotes@pioneerconcretecoatings.com";

    // Handle address formatting to avoid random commas
    const cityStateZip = [customer.city, customer.state, customer.zip]
        .filter(Boolean)
        .join(", ");

    // Financial calculations per user request (50% deposit/balance logic)
    const quoteTotal = Number(quote.total);
    const depositRequired = quoteTotal * 0.5;
    const balanceDue = quoteTotal - depositRequired;

    // Build scope-based line items for the document
    const scopeData = quote.scopeData as any;
    const scopeArea = Number(quote.scopeArea) || 0;
    const baseRate = Number(scopeData?.baseRate) || 0;
    const customItems = (scopeData?.customItems || []) as Array<{ name: string; sqft: number; rate: number }>;

    // Build display items from scope data
    const scopeLineItems: { description: string; quantity: number; unitPrice: number; total: number }[] = [];
    if (scopeArea > 0 && baseRate > 0) {
        // Build descriptive line item name from scope selections
        const prepType = scopeData?.prepType || "Standard Diamond Grind";
        const coatingType = scopeData?.coatingType || "Epoxy";
        const topCoatType = scopeData?.topCoatType || "";
        const flakeType = scopeData?.flakeType || "";
        const parts = [coatingType, topCoatType, flakeType].filter(Boolean).join(" + ");

        scopeLineItems.push({
            description: `${parts || "Epoxy Floor Coating"} System — ${prepType}`,
            quantity: scopeArea,
            unitPrice: baseRate,
            total: scopeArea * baseRate,
        });

        // Add custom items
        for (const ci of customItems) {
            if (ci.name && ci.sqft > 0 && ci.rate > 0) {
                scopeLineItems.push({
                    description: ci.name,
                    quantity: ci.sqft,
                    unitPrice: ci.rate,
                    total: ci.sqft * ci.rate,
                });
            }
        }

        // Add cleanup fee line item if selected
        if (scopeData?.jobsiteCleanup) {
            scopeLineItems.push({
                description: "Jobsite Clean Up & Waste Removal",
                quantity: 1,
                unitPrice: 150,
                total: 150,
            });
        }
    }

    // Use scope-based items if available, otherwise fall back to DB items
    const displayItems = scopeLineItems.length > 0 ? scopeLineItems : items.map((item: any) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
    }));

    return (
        <div className="max-w-7xl mx-auto px-4 space-y-8 pb-20">
            {/* Action Bar */}
            <div className="flex items-center justify-between no-print print:hidden bg-slate-50 p-4 rounded-lg border">
                <div className="flex items-center gap-4">
                    <Link href="/crm/quotes">
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                    <h1 className="text-xl font-bold text-slate-700">Quote #{quote.number}</h1>
                </div>
                <div className="flex gap-2">
                    <ConvertQuoteButton
                        quoteId={quote.id}
                        isConverted={!!quote.job}
                    />
                    <DeleteQuoteButton id={quote.id} />
                    <a href="#scope-calculator">
                        <Button variant="secondary" size="sm">
                            Edit
                        </Button>
                    </a>
                    <SendQuoteButton quoteId={quote.id} currentStatus={quote.status} />
                    <DownloadQuoteButton quoteId={quote.id} />
                    <PrintQuoteButton />
                    <AcceptQuoteButton quoteId={quote.id} />
                </div>
            </div>

            {/* Administrative / Planning Tools */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Formal Quote Paper */}
                <div className="lg:col-span-8 bg-white border shadow-sm p-8 md:p-12 text-slate-900 rounded-sm font-sans no-print flex flex-col">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-800 pb-8 mb-8">
                        <div className="space-y-4">
                            {/* Logo */}
                            <div className="h-20 flex items-center">
                                <img src={logoUrl} alt="Pioneer Concrete Coatings" className="h-full w-auto object-contain" />
                            </div>

                            <div className="text-sm space-y-1 font-medium text-slate-700">
                                <p className="font-bold text-2xl text-slate-900">Pioneer Concrete Coatings</p>
                                <p>{businessAddress}</p>
                                <p>{businessPhone}</p>
                                <p>{businessEmail}</p>
                            </div>
                        </div>
                        <div className="text-right space-y-2">
                            <h2 className="text-4xl font-bold text-slate-900 tracking-tight">QUOTE</h2>
                            <div className="text-slate-600">
                                <p className="font-mono text-lg font-bold">#{quote.number}</p>
                                <p className="text-sm mt-1">{new Date(quote.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="pt-2">
                                <Badge variant="outline" className="text-lg px-4 py-1 border-slate-900 text-slate-900 rounded-none uppercase tracking-widest font-bold">
                                    {quote.status}
                                </Badge>
                            </div>
                        </div>
                    </div>

                    {/* Client & Jobsite Info */}
                    <div className="grid grid-cols-2 gap-12 mb-8 text-sm">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Customer</h3>
                            <div className="text-slate-900 space-y-1 border-l-4 border-slate-200 pl-4">
                                <p className="font-bold text-lg">{customer.name}</p>
                                {customer.address && <p>{customer.address}</p>}
                                {cityStateZip && <p>{cityStateZip}</p>}
                                {customer.phone && <p>{customer.phone}</p>}
                                <p className="text-blue-600 underline">{customer.email}</p>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Jobsite Address</h3>
                            <div className="text-slate-900 space-y-1 border-l-4 border-slate-200 pl-4">
                                <p className="font-medium text-lg">
                                    {quote.jobLocation || "Same as Customer Address"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <div className="mb-8">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b-2 border-slate-900">
                                    <th className="py-3 text-sm font-bold uppercase tracking-wider text-slate-900">Description</th>
                                    <th className="py-3 text-right text-sm font-bold uppercase tracking-wider text-slate-900 w-24">Quantity</th>
                                    <th className="py-3 text-right text-sm font-bold uppercase tracking-wider text-slate-900 w-32">Unit Price</th>
                                    <th className="py-3 text-right text-sm font-bold uppercase tracking-wider text-slate-900 w-32">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayItems.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-8 text-center text-muted-foreground italic">
                                            No materials listed for this quote.
                                        </td>
                                    </tr>
                                ) : (
                                    displayItems.map((item: any, index: number) => (
                                        <tr key={index}>
                                            <td className="py-4 font-medium text-slate-900 max-w-md text-sm">{item.description}</td>
                                            <td className="py-4 text-right text-slate-600 text-sm">{item.quantity}</td>
                                            <td className="py-4 text-right text-slate-600 text-sm">${Number(item.unitPrice).toFixed(2)}</td>
                                            <td className="py-4 text-right font-medium text-slate-900 text-sm">${Number(item.total).toFixed(2)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Financial Totals */}
                    <div className="flex justify-end mb-16">
                        <div className="w-full md:w-80 space-y-3 bg-slate-50 p-6 rounded-xl border border-slate-100">
                            <div className="flex justify-between text-slate-600 text-sm">
                                <span>Subtotal:</span>
                                <span>${Number(quote.subtotal).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600 text-sm pb-3 border-b border-slate-200">
                                <span>Tax (6.25%):</span>
                                <span>${Number(quote.tax).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-slate-900 pt-2">
                                <span>Total Quote:</span>
                                <span>${quoteTotal.toFixed(2)}</span>
                            </div>
                            <div className="pt-4 space-y-2">
                                <div className="flex justify-between text-blue-700 font-bold bg-blue-100/50 p-3 rounded-lg border border-blue-200">
                                    <span>50% Deposit:</span>
                                    <span>${depositRequired.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Additional Project Comments */}
                    {(scopeData?.comments || quote.comments) && (
                        <div className="mb-12 border-t pt-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Additional Project Comments</h3>
                            <p className="text-slate-700 italic border-l-4 border-slate-200 pl-4 py-2 bg-slate-50/50 rounded-r-lg">
                                "{scopeData?.comments || quote.comments}"
                            </p>
                        </div>
                    )}

                    {/* Site Photos Gallery */}
                    {quote.photos && quote.photos.length > 0 && (
                        <div className="mb-12 border-t pt-8">
                            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Site Documentation</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {quote.photos.map((photo: any) => (
                                    <div key={photo.id} className="aspect-video rounded-lg overflow-hidden border bg-slate-50">
                                        <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Footer Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-slate-200 pt-10 text-[10px] text-slate-500">
                        <div>
                            <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-wider">Formal Payment Terms</h4>
                            <p className="leading-relaxed mb-4">
                                - 50% deposit required to confirm booking and secure materials.<br />
                                - Full balance due immediately upon completion of the coating installation.<br />
                            </p>

                            <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-wider">Premium Warranty</h4>
                            <p className="leading-relaxed">
                                Pioneer Concrete Coatings proudly stands behind our work with a comprehensive life-time limited warranty.
                            </p>
                        </div>
                        <div className="flex flex-col justify-between">
                            <div>
                                <h4 className="font-bold text-slate-700 mb-2 uppercase tracking-wider">Project Preparation</h4>
                                <p className="leading-relaxed">
                                    Ensure the jobsite is clear of all vehicles and items by 7:00 AM on the scheduled start date.
                                </p>
                            </div>
                            <div className="pt-4 border-t border-slate-100 mt-4">
                                <p className="font-bold text-slate-900 text-xs mb-1">Pioneer Concrete Coatings</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Planning & Scope Tools */}
                <div className="lg:col-span-4 space-y-8 no-print self-start sticky top-24">
                    <section id="scope-calculator" className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <h2 className="text-lg font-bold text-slate-900">Project Scoping</h2>
                        </div>
                        <JobAreaCalculator
                            quoteId={quote.id}
                            initialData={{
                                totalArea: Number(quote.scopeArea || 0),
                                baseRate: Number(quote.scopeData?.baseRate || 12),
                                scopeData: quote.scopeData
                            }}
                        />
                    </section>

                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="h-2 w-2 rounded-full bg-blue-600" />
                            <h2 className="text-lg font-bold text-slate-900">Site Photos</h2>
                        </div>
                        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 bg-slate-50 border-b">
                                <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Document "Before" State</p>
                            </div>
                            <div className="p-4">
                                <PhotoUploader
                                    quoteId={quote.id}
                                    existingPhotos={quote.photos?.map((p: any) => p.url) || []}
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
