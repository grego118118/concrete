"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, TicketCheck } from "lucide-react";
import { createTicket, updateTicketStatus, deleteTicket } from "@/app/actions/tickets";

type Ticket = {
    id: string;
    title: string;
    description: string | null;
    status: "OPEN" | "IN_PROGRESS" | "DONE";
    priority: "LOW" | "MEDIUM" | "HIGH";
    createdBy: string;
    createdAt: Date;
};

const STATUS_COLORS: Record<string, string> = {
    OPEN: "bg-red-100 text-red-700 border-red-200",
    IN_PROGRESS: "bg-amber-100 text-amber-700 border-amber-200",
    DONE: "bg-green-100 text-green-700 border-green-200",
};

const PRIORITY_COLORS: Record<string, string> = {
    LOW: "bg-slate-100 text-slate-600",
    MEDIUM: "bg-blue-100 text-blue-700",
    HIGH: "bg-red-100 text-red-700",
};

export function TroubleTicketCard({ initialTickets }: { initialTickets: Ticket[] }) {
    const [tickets, setTickets] = useState<Ticket[]>(initialTickets);
    const [showForm, setShowForm] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
    const [createdBy, setCreatedBy] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleCreate = () => {
        if (!title.trim() || !createdBy.trim()) return;
        startTransition(async () => {
            await createTicket({ title, description, priority, createdBy });
            setTickets(prev => [{
                id: Date.now().toString(),
                title,
                description: description || null,
                status: "OPEN",
                priority,
                createdBy,
                createdAt: new Date(),
            }, ...prev]);
            setTitle("");
            setDescription("");
            setPriority("MEDIUM");
            setCreatedBy("");
            setShowForm(false);
        });
    };

    const handleStatusChange = (id: string, status: "OPEN" | "IN_PROGRESS" | "DONE") => {
        startTransition(async () => {
            await updateTicketStatus(id, status);
            setTickets(prev => prev.map(t => t.id === id ? { ...t, status } : t));
        });
    };

    const handleDelete = (id: string) => {
        startTransition(async () => {
            await deleteTicket(id);
            setTickets(prev => prev.filter(t => t.id !== id));
        });
    };

    const open = tickets.filter(t => t.status !== "DONE");
    const done = tickets.filter(t => t.status === "DONE");

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TicketCheck className="h-4 w-4 text-muted-foreground" />
                        <CardTitle className="text-base">Trouble Tickets</CardTitle>
                        {open.length > 0 && (
                            <Badge className="bg-red-100 text-red-700 border-red-200 text-xs">{open.length} open</Badge>
                        )}
                    </div>
                    <Button size="sm" variant="outline" onClick={() => setShowForm(v => !v)}>
                        <Plus className="h-3.5 w-3.5 mr-1" />
                        Add
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="space-y-3">
                {showForm && (
                    <div className="border rounded-lg p-3 space-y-2 bg-slate-50">
                        <Input
                            placeholder="What needs to be fixed?"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                        />
                        <Textarea
                            placeholder="Details (optional)"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            rows={2}
                            className="text-sm"
                        />
                        <div className="flex gap-2">
                            <Input
                                placeholder="Your name"
                                value={createdBy}
                                onChange={e => setCreatedBy(e.target.value)}
                                className="flex-1"
                            />
                            <Select value={priority} onValueChange={v => setPriority(v as any)}>
                                <SelectTrigger className="w-28">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="LOW">Low</SelectItem>
                                    <SelectItem value="MEDIUM">Medium</SelectItem>
                                    <SelectItem value="HIGH">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex gap-2 pt-1">
                            <Button size="sm" onClick={handleCreate} disabled={isPending || !title.trim() || !createdBy.trim()}>
                                Submit
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                        </div>
                    </div>
                )}

                {tickets.length === 0 && !showForm && (
                    <p className="text-xs text-muted-foreground text-center py-4">No tickets. All clear!</p>
                )}

                {open.map(ticket => (
                    <div key={ticket.id} className="flex items-start gap-3 border rounded-lg p-3 bg-white">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-medium truncate">{ticket.title}</span>
                                <Badge className={`text-[10px] px-1.5 py-0 ${PRIORITY_COLORS[ticket.priority]}`}>
                                    {ticket.priority}
                                </Badge>
                            </div>
                            {ticket.description && (
                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{ticket.description}</p>
                            )}
                            <p className="text-[10px] text-muted-foreground mt-1">
                                By {ticket.createdBy} · {new Date(ticket.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                            <Select value={ticket.status} onValueChange={v => handleStatusChange(ticket.id, v as any)}>
                                <SelectTrigger className={`h-7 text-xs w-28 border ${STATUS_COLORS[ticket.status]}`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="OPEN">Open</SelectItem>
                                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                    <SelectItem value="DONE">Done</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                                onClick={() => handleDelete(ticket.id)}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </div>
                ))}

                {done.length > 0 && (
                    <details className="group">
                        <summary className="text-xs text-muted-foreground cursor-pointer hover:text-foreground list-none flex items-center gap-1 pt-1">
                            <span className="group-open:rotate-90 inline-block transition-transform">›</span>
                            {done.length} resolved
                        </summary>
                        <div className="space-y-2 mt-2">
                            {done.map(ticket => (
                                <div key={ticket.id} className="flex items-start gap-3 border rounded-lg p-3 bg-slate-50 opacity-60">
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-medium line-through truncate">{ticket.title}</span>
                                        <p className="text-[10px] text-muted-foreground mt-0.5">By {ticket.createdBy}</p>
                                    </div>
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">Done</Badge>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
                                            onClick={() => handleDelete(ticket.id)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </details>
                )}
            </CardContent>
        </Card>
    );
}
