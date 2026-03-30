"use client"

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { deleteQuote } from "@/app/actions/quotes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DeleteQuoteButton({ id }: { id: string }) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this advice? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteQuote(id);
        } catch (error: any) {
            // Next.js redirect() throws internally — treat NEXT_REDIRECT as success
            if (error?.message?.includes('NEXT_REDIRECT') || error?.digest?.includes('NEXT_REDIRECT')) return;
            console.error("Failed to delete quote:", error);
            alert("Failed to delete quote");
            setIsDeleting(false);
        }
    };

    return (
        <Button variant="destructive" size="sm" onClick={handleDelete} disabled={isDeleting}>
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting..." : "Delete Quote"}
        </Button>
    );
}
