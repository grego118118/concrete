"use client";

import { useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Mail, Globe, MapPin, Clock, Trash2, CheckSquare } from "lucide-react";
import { deleteLeads } from "@/app/actions/leads";
import { toast } from "sonner";

interface Lead {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    leadSource: string;
    leadScore: number | null;
    notes: string | null;
    createdAt: string | Date;
}

function SourceBadge({ source }: { source: string }) {
    switch (source) {
        case "SCRAPER":
            return <Badge variant="outline" className="text-blue-600 bg-blue-50 text-[10px]">Scraped</Badge>;
        case "WEBSITE":
            return <Badge variant="outline" className="text-green-600 bg-green-50 text-[10px]">Website</Badge>;
        default:
            return <Badge variant="outline" className="text-gray-600 bg-gray-50 text-[10px]">Manual</Badge>;
    }
}

function formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) {
        return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    if (digits.length === 11 && digits.startsWith("1")) {
        return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
    }
    return phone;
}

function extractWebsite(notes: string): string | null {
    const match = notes.match(/Website:\s*(.+)/);
    if (match) {
        const url = match[1].trim();
        if (url && url !== "N/A" && url.startsWith("http")) return url;
    }
    return null;
}

function extractCategory(notes: string): string | null {
    const match = notes.match(/Category:\s*(.+)/);
    if (match) return match[1].trim();
    return null;
}

function getLeadWebsite(lead: Lead): string | null {
    if (lead.notes && lead.leadSource === "SCRAPER") {
        return extractWebsite(lead.notes);
    }
    return null;
}

export function LeadList({ leads }: { leads: Lead[] }) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();

    const toggleSelect = (id: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selected.size === leads.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(leads.map(l => l.id)));
        }
    };

    const handleDelete = () => {
        if (selected.size === 0) return;

        const count = selected.size;
        startTransition(async () => {
            const result = await deleteLeads(Array.from(selected));
            if (result.error) {
                toast.error(`Failed to delete: ${result.error}`);
            } else {
                toast.success(`Deleted ${result.deleted} lead${result.deleted !== 1 ? "s" : ""}`);
                setSelected(new Set());
            }
        });
    };

    const isAllSelected = leads.length > 0 && selected.size === leads.length;

    return (
        <>
            {/* Toolbar */}
            {(selected.size > 0 || leads.length > 0) && (
                <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleSelectAll}
                            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <input
                                type="checkbox"
                                checked={isAllSelected}
                                onChange={toggleSelectAll}
                                className="rounded border-gray-300 h-3.5 w-3.5"
                            />
                            {isAllSelected ? "Deselect all" : "Select all"}
                        </button>
                        {selected.size > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {selected.size} selected
                            </span>
                        )}
                    </div>
                    {selected.size > 0 && (
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={handleDelete}
                            disabled={isPending}
                            className="h-7 text-xs gap-1"
                        >
                            <Trash2 className="h-3 w-3" />
                            {isPending ? "Deleting..." : `Delete (${selected.size})`}
                        </Button>
                    )}
                </div>
            )}

            {/* Lead Items */}
            <div className="divide-y">
                {leads.map((lead) => {
                    const website = getLeadWebsite(lead);
                    const isSelected = selected.has(lead.id);

                    return (
                        <div
                            key={lead.id}
                            className={`p-4 hover:bg-muted/50 transition-colors ${isSelected ? "bg-blue-50/50" : ""}`}
                        >
                            <div className="flex items-start gap-3">
                                {/* Checkbox */}
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(lead.id)}
                                    className="mt-0.5 rounded border-gray-300 h-4 w-4 shrink-0"
                                />

                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start mb-1.5">
                                        {/* Name as link to website */}
                                        {website ? (
                                            <a
                                                href={website}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-semibold text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
                                            >
                                                {lead.name}
                                                <Globe className="h-3 w-3 opacity-50" />
                                            </a>
                                        ) : (
                                            <h4 className="font-semibold text-sm">{lead.name}</h4>
                                        )}
                                        <div className="flex items-center gap-2 shrink-0">
                                            <SourceBadge source={lead.leadSource} />
                                            {lead.leadScore && (
                                                <Badge variant="secondary" className="text-[10px]">
                                                    Score: {lead.leadScore}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                                        {lead.phone && (
                                            <span className="flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {formatPhone(lead.phone)}
                                            </span>
                                        )}
                                        {lead.email && !lead.email.includes("placeholder") && !lead.email.includes("@internal.scraper") && (
                                            <span className="flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {lead.email}
                                            </span>
                                        )}
                                        {lead.city && (
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {lead.city}{lead.state ? `, ${lead.state}` : ""}
                                            </span>
                                        )}
                                    </div>

                                    {lead.address && (
                                        <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                                            <MapPin className="h-3 w-3 shrink-0" />
                                            {lead.address}
                                        </div>
                                    )}

                                    {lead.notes && lead.leadSource === "SCRAPER" && extractCategory(lead.notes) && (
                                        <div className="mt-1.5">
                                            <Badge variant="outline" className="text-[10px] font-normal">
                                                {extractCategory(lead.notes)}
                                            </Badge>
                                        </div>
                                    )}

                                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-2">
                                        <Clock className="h-3 w-3" />
                                        {new Date(lead.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}
