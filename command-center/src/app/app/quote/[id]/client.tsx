"use client";

import { useState, useRef } from "react";
import { CheckCircle2, AlertCircle, CreditCard, Calendar, Loader2, PartyPopper, Shield, Clock } from "lucide-react";
import confetti from "canvas-confetti";
import { acceptQuote } from "./accept-action";

interface QuoteAcceptClientProps {
    quoteId: string;
    quoteNumber: string;
    customerName: string;
    items: { description: string; quantity: number; unitPrice: number; total: number }[];
    subtotal: number;
    tax: number;
    total: number;
    deposit: number;
    cleanupFee?: number;
    notes?: string;
    isAlreadyAccepted: boolean;
    isSuccess: boolean;
    isCanceled: boolean;
}

export function QuoteAcceptClient({
    quoteId,
    quoteNumber,
    customerName,
    items,
    subtotal,
    tax,
    total,
    deposit,
    cleanupFee,
    notes,
    isAlreadyAccepted,
    isSuccess,
    isCanceled
}: QuoteAcceptClientProps) {
    const [accepted, setAccepted] = useState(isAlreadyAccepted || isSuccess);
    const [isAccepting, setIsAccepting] = useState(false);
    const [scheduledDate, setScheduledDate] = useState("");
    const acceptBtnRef = useRef<HTMLButtonElement>(null);

    const fireConfetti = () => {
        // Fire from the button position
        if (acceptBtnRef.current) {
            const rect = acceptBtnRef.current.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            // First burst from button
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { x, y },
                colors: ['#2563eb', '#3b82f6', '#1d4ed8', '#60a5fa', '#22c55e', '#f59e0b'],
                startVelocity: 30,
            });

            // Second wave slightly delayed
            setTimeout(() => {
                confetti({
                    particleCount: 80,
                    spread: 100,
                    origin: { x, y: y + 0.1 },
                    colors: ['#2563eb', '#22c55e', '#f59e0b', '#ec4899'],
                    startVelocity: 20,
                });
            }, 200);

            // Side cannons
            setTimeout(() => {
                confetti({
                    particleCount: 60,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0, y: 0.7 },
                    colors: ['#3b82f6', '#22c55e'],
                });
                confetti({
                    particleCount: 60,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1, y: 0.7 },
                    colors: ['#3b82f6', '#22c55e'],
                });
            }, 400);
        }
    };

    const handleAcceptAndSchedule = async () => {
        if (!scheduledDate) {
            alert("Please select a preferred start date first.");
            return;
        }

        setIsAccepting(true);
        try {
            await acceptQuote(quoteId, scheduledDate);
            fireConfetti();
            setAccepted(true);
        } catch (error) {
            console.error("Failed to accept quote:", error);
            alert("Something went wrong. Please try again.");
        } finally {
            setIsAccepting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 overflow-auto bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-100">
            {/* Header */}
            <header className="bg-slate-900 text-white">
                <div className="max-w-3xl mx-auto px-4 py-6 sm:py-8 text-center">
                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Pioneer Concrete Coatings</h1>
                    <p className="text-slate-400 text-sm mt-1">Professional Epoxy Floor Coating Systems</p>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                {/* Success Banner */}
                {accepted && (
                    <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 flex items-center gap-4 text-emerald-800 animate-in fade-in slide-in-from-top-4 duration-500">
                        <CheckCircle2 className="h-10 w-10 text-emerald-500 shrink-0" />
                        <div>
                            <h3 className="font-bold text-lg">Project Confirmed!</h3>
                            <p className="text-emerald-700">Thank you! Your project has been confirmed for {new Date(scheduledDate || Date.now()).toLocaleDateString()} and added to our production schedule. We&apos;ll be in touch within 24 hours.</p>
                        </div>
                    </div>
                )}

                {/* Greeting */}
                <div className="text-center space-y-1">
                    <p className="text-slate-500 text-sm font-medium uppercase tracking-widest">Quote #{quoteNumber}</p>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Hi {customerName}!</h2>
                    <p className="text-slate-500">Here&apos;s your personalized quote for review.</p>
                </div>

                {/* Quote Card */}
                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                    {/* Line Items */}
                    <div className="p-6">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Project Scope</h3>
                        <div className="divide-y divide-slate-100">
                            {items.map((item, i) => (
                                <div key={i} className="py-4 first:pt-0 last:pb-0">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-900">{item.description}</p>
                                            <p className="text-sm text-slate-500 mt-0.5">
                                                {item.quantity.toLocaleString()} sq ft × ${item.unitPrice.toFixed(2)}/ft²
                                            </p>
                                        </div>
                                        <p className="font-bold text-slate-900 whitespace-nowrap">
                                            ${item.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Additional Notes */}
                        {notes && (
                            <div className="mt-6 pt-6 border-t border-slate-100">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Additional Comments</h4>
                                <p className="text-slate-600 text-sm whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100">
                                    {notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Totals */}
                    <div className="bg-slate-50 border-t border-slate-200 p-6 space-y-3">
                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Subtotal</span>
                            <span>${subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>

                        {/* Cleanup Fee */}
                        {cleanupFee && cleanupFee > 0 && (
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Cleanup Fee</span>
                                <span>${cleanupFee.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                            </div>
                        )}

                        <div className="flex justify-between text-sm text-slate-600">
                            <span>Tax (6.25%)</span>
                            <span>${tax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-xl font-bold text-slate-900 pt-3 border-t border-slate-200">
                            <span>Total</span>
                            <span>${total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between text-sm font-medium text-blue-600 pt-1">
                            <span>50% Deposit Due</span>
                            <span>${deposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                </div>

                {/* Accept / Schedule Section */}
                {!accepted && (
                    <div className="bg-white rounded-2xl shadow-xl border-2 border-blue-100 p-8 text-center space-y-6">
                        <div className="space-y-2">
                            <PartyPopper className="h-10 w-10 text-blue-500 mx-auto" />
                            <h3 className="text-xl font-bold text-slate-900">Ready to Get Started?</h3>
                            <p className="text-slate-500 max-w-md mx-auto">
                                Select your preferred start date below to accept this quote and schedule your project.
                            </p>
                        </div>

                        {/* Date Picker */}
                        <div className="space-y-2 max-w-sm mx-auto text-left">
                            <label htmlFor="start-date" className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-blue-600" />
                                Preferred Start Date
                            </label>
                            <input
                                id="start-date"
                                type="date"
                                className="w-full h-12 px-4 border-2 border-slate-200 rounded-xl text-slate-900 font-medium focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition-colors"
                                value={scheduledDate}
                                onChange={(e) => setScheduledDate(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                            />
                            <p className="text-xs text-slate-500">
                                We&apos;ll do our best to accommodate this date and confirm with you within 24 hours.
                            </p>
                        </div>

                        <button
                            ref={acceptBtnRef}
                            onClick={handleAcceptAndSchedule}
                            disabled={isAccepting || !scheduledDate}
                            className="inline-flex items-center justify-center gap-2 px-12 py-4 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-xl shadow-lg shadow-blue-200 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                            {isAccepting ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <CheckCircle2 className="h-5 w-5" />
                            )}
                            {isAccepting ? "Confirming..." : "Accept & Schedule Project"}
                        </button>

                        <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
                            <span className="flex items-center gap-1"><Shield className="h-3.5 w-3.5" /> Secure Acceptance</span>
                            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> Valid 30 days</span>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center space-y-2 pt-8 pb-12">
                    <p className="text-slate-400 text-xs font-medium uppercase tracking-widest">Questions? We&apos;re here to help.</p>
                    <p className="text-slate-600 font-bold">(413) 544-4933</p>
                    <p className="text-slate-500 text-sm">quotes@pioneerconcretecoatings.com</p>
                    <p className="text-slate-300 text-xs mt-4">Pioneer Concrete Coatings • Serving Southern New England</p>
                </footer>
            </main>
        </div>
    );
}
