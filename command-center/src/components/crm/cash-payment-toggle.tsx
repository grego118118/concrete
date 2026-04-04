"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Banknote, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CashPaymentToggleProps {
    entityId: string;
    isCashPayment: boolean;
    onToggle: (id: string) => Promise<{ cashPayment: boolean }>;
}

export function CashPaymentToggle({ entityId, isCashPayment, onToggle }: CashPaymentToggleProps) {
    const [cashPayment, setCashPayment] = useState(isCashPayment);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleToggle = () => {
        startTransition(async () => {
            try {
                const result = await onToggle(entityId);
                setCashPayment(result.cashPayment);
                toast.success(
                    result.cashPayment
                        ? "Cash payment enabled — no Stripe link will be sent."
                        : "Stripe payment restored — payment link will be included."
                );
                router.refresh();
            } catch {
                toast.error("Failed to update payment method.");
            }
        });
    };

    if (cashPayment) {
        return (
            <Button
                variant="outline"
                size="sm"
                onClick={handleToggle}
                disabled={isPending}
                className="border-amber-400 bg-amber-50 text-amber-700 hover:bg-amber-100 hover:border-amber-500 transition-colors"
                title="Cash payment is ON — click to re-enable Stripe"
            >
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Banknote className="mr-2 h-4 w-4" />
                )}
                Cash Payment
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleToggle}
            disabled={isPending}
            className="hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 transition-colors"
            title="Click to enable cash payment (disables Stripe link)"
        >
            {isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <CreditCard className="mr-2 h-4 w-4" />
            )}
            Cash Override
        </Button>
    );
}
