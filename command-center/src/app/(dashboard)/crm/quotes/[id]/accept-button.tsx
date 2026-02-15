"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import confetti from "canvas-confetti";

import { convertQuoteToJob } from "@/app/actions/workflow";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface AcceptQuoteButtonProps {
    quoteId: string;
    onAccept?: () => void;
}

export function AcceptQuoteButton({ quoteId, onAccept }: AcceptQuoteButtonProps) {
    const [isAccepted, setIsAccepted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleAccept = async () => {
        setIsLoading(true);

        try {
            // Trigger confetti
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#2563eb', '#3b82f6', '#1d4ed8', '#60a5fa'] // Blue variations for Pioneer branding
            });

            // Call server action to create job
            const job = await convertQuoteToJob(quoteId);

            setIsAccepted(true);
            toast.success("Quote accepted and Job created!");

            // Optional: Redirect to job or just invoke callback
            if (onAccept) {
                onAccept();
            } else {
                // If no callback, maybe we want to refresh or go to job? 
                // For 'Accept', staying here with success state is often nice, but let's refresh to show status updates
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to accept quote. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };




    if (isAccepted) {
        return (
            <Button disabled className="bg-emerald-600 text-white cursor-default">
                <Check className="mr-2 h-4 w-4" />
                Quote Accepted
            </Button>
        );
    }

    return (
        <Button
            onClick={handleAccept}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-8"
        >
            Accept Quote & Start Job
        </Button>
    );
}
