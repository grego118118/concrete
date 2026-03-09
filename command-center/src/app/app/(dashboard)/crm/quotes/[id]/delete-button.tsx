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
            // Router refresh or redirect is handled by the server action's redirect, 
            // but we can ensure client state is consistent or handle error
        } catch (error) {
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
