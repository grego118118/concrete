"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

interface DownloadQuoteButtonProps {
    quoteId: string;
}

export function DownloadQuoteButton({ quoteId }: DownloadQuoteButtonProps) {
    const handleDownload = () => {
        // Open PDF in a new browser tab so user can view and print/save it
        window.open(`/api/crm/quotes/${quoteId}/pdf`, "_blank");
    };

    return (
        <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
        >
            <Download className="mr-2 h-4 w-4" />
            Download PDF
        </Button>
    );
}
