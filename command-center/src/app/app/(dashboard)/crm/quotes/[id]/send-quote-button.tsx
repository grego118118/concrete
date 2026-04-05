"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Mail, Loader2, Check } from "lucide-react";
import { sendQuote } from "@/app/actions/quotes";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function SendQuoteButton({ quoteId, currentStatus, customerEmail }: { quoteId: string, currentStatus: string, customerEmail?: string }) {
    const [status, setStatus] = useState<'IDLE' | 'RUNNING' | 'COMPLETED' | 'FAILED'>('IDLE');
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const taskName = `Send Quote: ${quoteId}`;

    const handleSend = async () => {
        setStatus('RUNNING');
        setError(null);
        try {
            const res = await fetch('/app/api/quotes/send', {
                method: 'POST',
                body: JSON.stringify({ quoteId, customerEmail }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to initiate send');
            }

            toast.info("Sending email in background...");
        } catch (err: any) {
            console.error(err);
            setStatus('FAILED');
            setError(err.message);
            toast.error(err.message || "Failed to start sending.");
        }
    };

    // Polling effect
    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (status === 'RUNNING') {
            interval = setInterval(async () => {
                try {
                    const res = await fetch(`/app/api/tradeops/sync-status?taskName=${encodeURIComponent(taskName)}`);
                    const data = await res.json();

                    if (data.status === 'COMPLETED') {
                        setStatus('COMPLETED');
                        toast.success("Quote sent successfully!");
                        router.refresh();
                        clearInterval(interval);
                    } else if (data.status === 'FAILED') {
                        setStatus('FAILED');
                        setError(data.errorMessage || 'Unknown Error');
                        toast.error(`Failed: ${data.errorMessage}`);
                        clearInterval(interval);
                    }
                } catch (err) {
                    console.error('Polling error:', err);
                }
            }, 2000);
        }

        return () => clearInterval(interval);
    }, [status, taskName, router]);

    const isSent = currentStatus === "SENT" && status === 'IDLE';

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleSend}
            disabled={status === 'RUNNING' || status === 'COMPLETED'}
            className={`transition-colors ${status === 'FAILED' ? 'border-red-200 bg-red-50 text-red-600 hover:bg-red-100' :
                isSent ? 'text-emerald-600 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 hover:text-emerald-700' :
                'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200'
                }`}
        >
            {status === 'RUNNING' ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : isSent ? (
                <Check className="mr-2 h-4 w-4" />
            ) : (
                <Mail className="mr-2 h-4 w-4" />
            )}
            {status === 'RUNNING' ? 'Sending...' : status === 'FAILED' ? 'Retry Sending' : isSent ? 'Resend Quote' : 'Send to Customer'}
        </Button>
    );
}
