"use client";

import { useState, useRef, useEffect } from "react";
import { CheckCircle2, AlertCircle, CreditCard, Loader2, PartyPopper, Shield, Clock } from "lucide-react";
import confetti from "canvas-confetti";
import { acceptQuote } from "./accept-action";

interface Customer {
    name: string;
    email: string;
    phone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zip?: string | null;
}

interface QuoteAcceptClientProps {
    quoteId: string;
    quoteNumber: string;
    customer: Customer;
    items: { description: string; quantity: number; unitPrice: number; total: number }[];
    subtotal: number;
    discount?: number;
    discountRate?: number;
    tax: number;
    total: number;
    deposit: number;
    cleanupFee?: number;
    notes?: string;
    isAlreadyAccepted: boolean;
    isSuccess: boolean;
    isCanceled: boolean;
    paymentLink?: string;
    // Scope details
    scopeData?: any;
    scopeArea?: number;
    jobLocation?: string | null;
    createdAt: string;
    photos?: { id: string; url: string; caption?: string | null }[];
    showScheduler?: boolean;
    isCashPayment?: boolean;
}

function fmt(n: number) {
    return n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function QuoteAcceptClient({
    quoteId,
    quoteNumber,
    customer,
    items,
    subtotal,
    discount,
    discountRate,
    tax,
    total,
    deposit,
    cleanupFee,
    notes,
    isAlreadyAccepted,
    isSuccess,
    isCanceled,
    paymentLink,
    scopeData,
    scopeArea,
    jobLocation,
    createdAt,
    photos,
    showScheduler = true,
    isCashPayment = false,
}: QuoteAcceptClientProps) {
    const [accepted, setAccepted] = useState(isAlreadyAccepted || isSuccess);
    const [isAccepting, setIsAccepting] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");
    const acceptBtnRef = useRef<HTMLButtonElement>(null);
    const [paymentLinkState, setPaymentLinkState] = useState(paymentLink);
    const [isPolling, setIsPolling] = useState(false);
    const [syncStatus, setSyncStatus] = useState<string | null>(null);

    const fireConfetti = () => {
        if (acceptBtnRef.current) {
            const rect = acceptBtnRef.current.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            confetti({ particleCount: 100, spread: 70, origin: { x, y }, colors: ['#2563eb', '#3b82f6', '#22c55e', '#f59e0b'], startVelocity: 30 });
            setTimeout(() => confetti({ particleCount: 80, spread: 100, origin: { x, y: y + 0.1 }, colors: ['#2563eb', '#22c55e', '#f59e0b', '#ec4899'], startVelocity: 20 }), 200);
            setTimeout(() => {
                confetti({ particleCount: 60, angle: 60, spread: 55, origin: { x: 0, y: 0.7 }, colors: ['#3b82f6', '#22c55e'] });
                confetti({ particleCount: 60, angle: 120, spread: 55, origin: { x: 1, y: 0.7 }, colors: ['#3b82f6', '#22c55e'] });
            }, 400);
        }
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;
        let timeout: NodeJS.Timeout;
        if (accepted && !paymentLinkState && !isPolling && !isCashPayment) {
            setIsPolling(true);
            const poll = async () => {
                try {
                    const { getQuotePaymentStatus } = await import("./accept-action");
                    const status = await getQuotePaymentStatus(quoteId);
                    if (status.paymentLink) { setPaymentLinkState(status.paymentLink); setSyncStatus('COMPLETED'); setIsPolling(false); return true; }
                    if (status.invoiceStatus === 'FAILED') { setSyncStatus('FAILED'); setIsPolling(false); return true; }
                } catch { }
                return false;
            };
            poll();
            interval = setInterval(async () => { const done = await poll(); if (done) clearInterval(interval); }, 5000);
            timeout = setTimeout(() => { clearInterval(interval); setIsPolling(false); setSyncStatus('FAILED'); }, 30000);
        }
        return () => { if (interval) clearInterval(interval); if (timeout) clearTimeout(timeout); };
    }, [accepted, quoteId]);

    const handleAcceptAndSchedule = async () => {
        if (showScheduler && !scheduledDate) { alert("Please select a preferred start date first."); return; }
        setIsAccepting(true);
        try {
            const result = await acceptQuote(quoteId, scheduledDate);
            if (result && 'error' in result) { alert(`Error: ${result.error}`); }
            else { fireConfetti(); setAccepted(true); }
        } catch { alert("Connection lost. Please try again."); }
        finally { setIsAccepting(false); }
    };

    const scopeFields: { label: string; value: string }[] = [];
    if (scopeArea && scopeArea > 0) scopeFields.push({ label: 'Total Area', value: `${scopeArea.toLocaleString()} sq ft` });
    if (scopeData?.prepType) scopeFields.push({ label: 'Prep Work', value: scopeData.prepType });
    if (scopeData?.coatingType) scopeFields.push({ label: 'Base Coat', value: scopeData.coatingType });
    if (scopeData?.topCoatType) scopeFields.push({ label: 'Top Coat', value: scopeData.topCoatType });
    if (scopeData?.flakeType) scopeFields.push({ label: 'Flake Broadcast', value: scopeData.flakeType });

    const dateStr = new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    const additionalComments = scopeData?.comments || notes;

    return (
        <div className="min-h-screen bg-slate-100 py-8 px-4">
            {/* Paper document */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-sm">

                {/* ── Header ── */}
                <div className="flex justify-between items-start px-10 pt-10 pb-7 border-b-2 border-slate-900">
                    <div className="flex items-start gap-4">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/logo.png" alt="Pioneer Concrete Coatings" className="w-14 h-14 object-contain" onError={e => (e.currentTarget.style.display = 'none')} />
                        <div>
                            <p className="text-xl font-black text-slate-900 leading-tight">Pioneer Concrete Coatings</p>
                            <p className="text-xs text-slate-500 mt-0.5">Serving Southern New England</p>
                            <p className="text-xs text-slate-500">(413) 544-4933</p>
                            <p className="text-xs text-slate-500">quotes@pioneerconcretecoatings.com</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-4xl font-black text-slate-900 tracking-tight">QUOTE</p>
                        <p className="text-base font-bold text-slate-700 mt-1">#{quoteNumber}</p>
                        <p className="text-sm text-slate-500 mt-0.5">{dateStr}</p>
                    </div>
                </div>

                <div className="px-10 py-6 space-y-6">

                    {/* ── Confirmed / Paid Banner ── */}
                    {accepted && (
                        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-lg p-5 space-y-4">
                            <div className="flex items-start gap-3 text-emerald-800">
                                <CheckCircle2 className="h-8 w-8 text-emerald-500 shrink-0 mt-0.5" />
                                <div>
                                    <p className="font-bold text-lg">Project Confirmed!</p>
                                    <p className="text-emerald-700 text-sm mt-0.5">
                                        Thank you! Your project has been confirmed and added to our production schedule.
                                        {scheduledDate ? ` Reserved for ${new Date(scheduledDate).toLocaleDateString()}.` : ""} We&apos;ll be in touch within 24 hours.
                                    </p>
                                </div>
                            </div>
                            {isCashPayment ? (
                                <div className="pt-3 border-t border-emerald-200 space-y-1">
                                    <p className="text-sm font-bold text-emerald-800">Payment Instructions</p>
                                    <p className="text-sm text-emerald-700">A 50% deposit of <span className="font-bold">${fmt(deposit)}</span> is due prior to the start of your project.</p>
                                    <p className="text-sm text-emerald-700">Our team will be in touch to arrange payment. We accept cash and check.</p>
                                </div>
                            ) : paymentLinkState ? (
                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-3 border-t border-emerald-200">
                                    <div className="flex-1 text-sm text-emerald-700">
                                        <p className="font-bold">Ready to pay the deposit?</p>
                                        <p>Pay securely online to lock in your date.</p>
                                    </div>
                                    <a href={paymentLinkState} target="_blank" rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-md transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap">
                                        <CreditCard className="h-4 w-4" />
                                        Pay 50% Deposit Now
                                    </a>
                                </div>
                            ) : syncStatus === 'FAILED' ? (
                                <p className="text-sm text-red-700 font-medium flex items-center gap-2 pt-3 border-t border-red-100">
                                    <AlertCircle className="h-4 w-4" />
                                    We&apos;re finalizing your payment portal. A separate email will arrive within 24 hours.
                                </p>
                            ) : (
                                <p className="text-sm text-emerald-700 italic flex items-center gap-2 pt-3 border-t border-emerald-100">
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                    Preparing your secure payment link...
                                </p>
                            )}
                        </div>
                    )}

                    {/* ── Customer / Jobsite ── */}
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Customer</p>
                            <div className="border-l-4 border-slate-200 pl-3 space-y-0.5">
                                <p className="font-bold text-slate-900">{customer.name}</p>
                                {customer.address && <p className="text-sm text-slate-600">{customer.address}</p>}
                                {customer.city && <p className="text-sm text-slate-600">{customer.city}{customer.state ? `, ${customer.state}` : ''}{customer.zip ? ` ${customer.zip}` : ''}</p>}
                                {customer.phone && <p className="text-sm text-slate-600">{customer.phone}</p>}
                                <p className="text-sm text-blue-600">{customer.email}</p>
                            </div>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Jobsite Address</p>
                            <div className="border-l-4 border-slate-200 pl-3">
                                <p className="text-sm text-slate-700">{jobLocation || "Same as Customer Address"}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Project Scope ── */}
                    {scopeFields.length > 0 && (
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-900 mb-3">Project Scope</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded p-4">
                                {scopeFields.map(f => (
                                    <div key={f.label}>
                                        <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{f.label}</p>
                                        <p className="text-sm font-semibold text-slate-900 mt-0.5">{f.value}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Site Photos ── */}
                    {photos && photos.length > 0 && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Site Photos</p>
                            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                                {photos.map(p => (
                                    <div key={p.id} className="aspect-square rounded overflow-hidden border border-slate-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={p.url} alt={p.caption || ''} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* ── Line Items Table ── */}
                    <div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b-2 border-slate-900">
                                    <th className="text-left pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[45%]">Description</th>
                                    <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[15%]">Qty (sqft)</th>
                                    <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[20%]">Rate</th>
                                    <th className="text-right pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-900 w-[20%]">Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item, i) => (
                                    <tr key={i} className="border-b border-slate-100">
                                        <td className="py-3 text-slate-800">{item.description}</td>
                                        <td className="py-3 text-right text-slate-700">{item.quantity.toLocaleString()}</td>
                                        <td className="py-3 text-right text-slate-700">${fmt(item.unitPrice)}</td>
                                        <td className="py-3 text-right font-semibold text-slate-900">${fmt(item.total)}</td>
                                    </tr>
                                ))}
                                {cleanupFee && cleanupFee > 0 && (
                                    <tr className="border-b border-slate-100">
                                        <td className="py-3 text-slate-800">Jobsite Clean Up &amp; Waste Removal</td>
                                        <td className="py-3 text-right text-slate-700">1</td>
                                        <td className="py-3 text-right text-slate-700">${fmt(cleanupFee)}</td>
                                        <td className="py-3 text-right font-semibold text-slate-900">${fmt(cleanupFee)}</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* ── Additional Comments ── */}
                    {additionalComments && (
                        <div>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Additional Project Comments</p>
                            <p className="text-sm text-slate-600 italic bg-slate-50 border border-slate-100 rounded p-3 whitespace-pre-wrap">{additionalComments}</p>
                        </div>
                    )}

                    {/* ── Totals ── */}
                    <div className="flex justify-end">
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span>${fmt(subtotal)}</span>
                            </div>
                            {discount && discount > 0 ? (
                                <div className="flex justify-between text-sm font-semibold text-blue-700">
                                    <span>Discount ({discountRate}%)</span>
                                    <span>−${fmt(discount)}</span>
                                </div>
                            ) : null}
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Tax (6.25%)</span>
                                <span>${fmt(tax)}</span>
                            </div>
                            <div className="flex justify-between font-black text-xl text-slate-900 pt-3 border-t-2 border-slate-900">
                                <span>Total Quote</span>
                                <span>${fmt(total)}</span>
                            </div>
                            {/* Deposit box */}
                            <div className="flex justify-between items-center bg-blue-50 border border-blue-200 rounded px-3 py-2 mt-2">
                                <span className="text-sm font-bold text-blue-800">50% Deposit Due to Book</span>
                                <span className="font-bold text-blue-800">${fmt(deposit)}</span>
                            </div>
                        </div>
                    </div>

                    {/* ── Accept CTA (only when not yet accepted) ── */}
                    {!accepted && (
                        <div className="bg-emerald-50 border-2 border-emerald-400 rounded-lg p-6 text-center space-y-5">
                            <div className="space-y-1">
                                <PartyPopper className="h-9 w-9 text-emerald-600 mx-auto" />
                                <p className="text-lg font-black text-slate-900">Ready to Accept This Quote?</p>
                                <p className="text-sm text-slate-600 max-w-md mx-auto">
                                    {showScheduler
                                        ? "Select your preferred start date below to accept this quote and schedule your project."
                                        : "Click below to accept this quote and we'll be in touch to schedule your project."}
                                </p>
                            </div>
                            {showScheduler && (
                                <div className="space-y-1.5 max-w-sm mx-auto text-left">
                                    <label htmlFor="start-date" className="text-sm font-bold text-slate-700">Preferred Start Date</label>
                                    <input
                                        id="start-date"
                                        type="date"
                                        className="w-full h-11 px-4 border-2 border-slate-200 rounded-lg text-slate-900 font-medium focus:border-emerald-500 focus:outline-none"
                                        value={scheduledDate}
                                        onChange={e => setScheduledDate(e.target.value)}
                                        min={new Date().toISOString().split("T")[0]}
                                    />
                                    <p className="text-xs text-slate-500">We&apos;ll do our best to accommodate this date and confirm within 24 hours.</p>
                                </div>
                            )}
                            <button
                                ref={acceptBtnRef}
                                onClick={handleAcceptAndSchedule}
                                disabled={isAccepting || (showScheduler && !scheduledDate)}
                                className="inline-flex items-center justify-center gap-2 px-10 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold rounded-lg shadow-lg shadow-emerald-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                            >
                                {isAccepting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                                {isAccepting ? "Confirming..." : showScheduler ? "Accept & Schedule Project" : "Accept Quote"}
                            </button>
                            <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
                                <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure Acceptance</span>
                                <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Valid 30 days</span>
                            </div>
                        </div>
                    )}

                    {/* ── Footer ── */}
                    <div className="grid grid-cols-2 gap-8 pt-6 border-t border-slate-200 pb-4">
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Payment Terms</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                50% deposit required to confirm booking and secure materials.<br />
                                Full balance due immediately upon completion of the coating installation.
                            </p>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mt-3 mb-1.5">Premium Warranty</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Pioneer Concrete Coatings proudly stands behind our work with a comprehensive lifetime limited warranty.
                            </p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Project Preparation</p>
                            <p className="text-[11px] text-slate-500 leading-relaxed">
                                Ensure the surface to be prepped is clear of all vehicles and items by 7:00 AM on the scheduled start date. The surrounding area must be easily accessible and not a hindrance to personnel, tools, and equipment.
                            </p>
                            <p className="text-[11px] font-bold text-slate-700 mt-3">Pioneer Concrete Coatings</p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Contact footer */}
            <div className="max-w-4xl mx-auto text-center space-y-1 pt-6 pb-10">
                <p className="text-slate-500 text-xs font-medium uppercase tracking-widest">Questions? We&apos;re here to help.</p>
                <p className="text-slate-600 font-bold">(413) 544-4933</p>
                <p className="text-slate-400 text-xs">quotes@pioneerconcretecoatings.com</p>
            </div>
        </div>
    );
}
