"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, Check } from "lucide-react";
import { sendQuote } from "@/app/actions/quotes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SendQuoteButton({ quoteId, currentStatus }: { quoteId: string, currentStatus: string }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleSend = async () => {
        setIsLoading(true);
        try {
            await sendQuote(quoteId);
            toast.success("Quote sent to customer!");
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error("Failed to send quote.");
        } finally {
            setIsLoading(false);
        }
    };

    if (currentStatus === "SENT") {
        return (
            <Button variant="outline" size="sm" disabled className="text-emerald-600 border-emerald-200 bg-emerald-50">
                <Check className="mr-2 h-4 w-4" />
                Quote Sent
            </Button>
        );
    }

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSend}
            disabled={isLoading}
            className="hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Mail className="mr-2 h-4 w-4" />
            )}
            Send to Customer
        </Button>
    );
}
