"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Briefcase, Loader2, Check } from "lucide-react";
import { convertQuoteToJob } from "@/app/actions/workflow";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function ConvertQuoteButton({ quoteId, isConverted }: { quoteId: string, isConverted: boolean }) {
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const handleConvert = async () => {
        setIsLoading(true);
        try {
            const job = await convertQuoteToJob(quoteId);
            toast.success("Quote converted to Job!");
            router.push(`/crm/jobs/${job.id}`);
        } catch (error) {
            console.error(error);
            toast.error("Handover failed. Please check your data.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isConverted) {
        return (
            <Button disabled variant="outline" className="border-emerald-500 text-emerald-600">
                <Check className="mr-2 h-4 w-4" />
                Handed Over to Production
            </Button>
        );
    }

    return (
        <Button
            onClick={handleConvert}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
        >
            {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
                <Briefcase className="mr-2 h-4 w-4" />
            )}
            Convert to Job
        </Button>
    );
}
