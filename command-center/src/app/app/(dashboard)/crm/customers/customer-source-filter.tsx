"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function CustomerSourceFilter({ currentSource }: { currentSource: string }) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const handleChange = (value: string) => {
        const params = new URLSearchParams(searchParams?.toString() ?? "");
        if (value === "all") {
            params.delete("source");
        } else {
            params.set("source", value);
        }
        router.push(`?${params.toString()}`);
    };

    return (
        <Select value={currentSource} onValueChange={handleChange}>
            <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="All Sources" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="MANUAL">Manual / Direct</SelectItem>
                <SelectItem value="SCRAPER">Scraped</SelectItem>
                <SelectItem value="WEBSITE">Website</SelectItem>
            </SelectContent>
        </Select>
    );
}
