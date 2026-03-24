"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useState, useEffect } from "react";

export function CustomerSearch({ initialSearch }: { initialSearch: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [searchTerm, setSearchTerm] = useState(initialSearch);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params = new URLSearchParams(searchParams?.toString() ?? "");
            if (searchTerm) {
                params.set("search", searchTerm);
            } else {
                params.delete("search");
            }
            router.push(`?${params.toString()}`);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, router, searchParams]);

    return (
        <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search customers..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    );
}
