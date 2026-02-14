"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, CreditCard, Loader2 } from "lucide-react";
import { createDepositCheckoutSession } from "@/app/actions/payments";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PaymentFlowProps {
    quoteId: string;
    depositAmount: string;
}

export function PaymentFlow({ quoteId, depositAmount }: PaymentFlowProps) {
    const [scheduledDate, setScheduledDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        if (!scheduledDate) {
            alert("Please select a preferred start date first.");
            return;
        }

        try {
            setIsLoading(true);
            const checkoutUrl = await createDepositCheckoutSession(quoteId, scheduledDate);
            if (checkoutUrl) {
                window.location.href = checkoutUrl;
            }
        } catch (error) {
            console.error("Payment error:", error);
            alert("Could not initialize payment. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-blue-600" />
                Schedule & Pay Deposit
            </h3>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="scheduled-date" className="text-sm font-medium text-slate-700">
                        Preferred Start Date
                    </Label>
                    <Input
                        id="scheduled-date"
                        type="date"
                        className="bg-white border-slate-300 focus:ring-blue-500"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split("T")[0]}
                    />
                    <p className="text-xs text-slate-500">
                        Select your preferred date. We will confirm the final schedule within 24 hours.
                    </p>
                </div>

                <div className="pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-slate-600 font-medium">Deposit Due (50%):</span>
                        <span className="text-2xl font-bold text-blue-600">${depositAmount}</span>
                    </div>

                    <Button
                        size="lg"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-14 shadow-md transition-all hover:scale-[1.02]"
                        onClick={handlePayment}
                        disabled={isLoading || !scheduledDate}
                    >
                        {isLoading ? (
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        ) : (
                            <CreditCard className="mr-2 h-5 w-5" />
                        )}
                        {isLoading ? "Preparing Checkout..." : "Pay Deposit & Confirm Schedule"}
                    </Button>

                    <div className="mt-4 flex items-center justify-center gap-6 opacity-60 grayscale hover:grayscale-0 transition-all">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-6" />
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                    </div>
                </div>
            </div>
        </div>
    );
}
