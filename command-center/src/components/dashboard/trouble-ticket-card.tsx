"use client";

import { useState, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, Trash2, TicketCheck } from "lucide-react";
import { createTicket, updateTicketStatus, updateTicket, deleteTicket } from "@/app/actions/tickets";

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

    // Edit modal state
    const [editTicket, setEditTicket] = useState<Ticket | null>(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPriority, setEditPriority] = useState<"LOW" | "MEDIUM" | "HIGH">("MEDIUM");
    const [editStatus, setEditStatus] = useState<"OPEN" | "IN_PROGRESS" | "DONE">("OPEN");

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
            if (editTicket?.id === id) setEditTicket(null);
        });
    };

    const openEdit = (ticket: Ticket) => {
        setEditTicket(ticket);
        setEditTitle(ticket.title);
        setEditDescription(ticket.description || "");
        setEditPriority(ticket.priority);
        setEditStatus(ticket.status);
    };

    const handleSaveEdit = () => {
        if (!editTicket || !editTitle.trim()) return;
        startTransition(async () => {
            await updateTicket(editTicket.id, {
                title: editTitle,
                description: editDescription,
                priority: editPriority,
                status: editStatus,
            });
            setTickets(prev => prev.map(t => t.id === editTicket.id ? {
                ...t,
                title: editTitle,
                description: editDescription || null,
                priority: editPriority,
                status: editStatus,
            } : t));
            setEditTicket(null);
        });
    };

    const open = tickets.filter(t => t.status !== "DONE");
    const done = tickets.filter(t => t.status === "DONE");

    return (
        <>
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
                        <div
                            key={ticket.id}
                            className="flex items-start gap-3 border rounded-lg p-3 bg-white cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                            onClick={() => openEdit(ticket)}
                        >
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
                            <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
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
                                    <div
                                        key={ticket.id}
                                        className="flex items-start gap-3 border rounded-lg p-3 bg-slate-50 opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => openEdit(ticket)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <span className="text-sm font-medium line-through truncate">{ticket.title}</span>
                                            <p className="text-[10px] text-muted-foreground mt-0.5">By {ticket.createdBy}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
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

            {/* Ticket Edit/View Modal */}
            <Dialog open={!!editTicket} onOpenChange={open => { if (!open) setEditTicket(null); }}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <TicketCheck className="h-4 w-4" />
                            Ticket Details
                        </DialogTitle>
                    </DialogHeader>

                    {editTicket && (
                        <div className="space-y-4 py-2">
                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Title</label>
                                <Input
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    className="mt-1"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description</label>
                                <Textarea
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    rows={4}
                                    className="mt-1 text-sm"
                                    placeholder="Add more details..."
                                />
                            </div>

                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</label>
                                    <Select value={editStatus} onValueChange={v => setEditStatus(v as any)}>
                                        <SelectTrigger className={`mt-1 ${STATUS_COLORS[editStatus]}`}>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="OPEN">Open</SelectItem>
                                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                            <SelectItem value="DONE">Done</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex-1">
                                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Priority</label>
                                    <Select value={editPriority} onValueChange={v => setEditPriority(v as any)}>
                                        <SelectTrigger className="mt-1">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="LOW">Low</SelectItem>
                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                            <SelectItem value="HIGH">High</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="text-xs text-muted-foreground pt-1">
                                <span>Reported by <strong>{editTicket.createdBy}</strong></span>
                                <span className="mx-2">·</span>
                                <span>{new Date(editTicket.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="flex justify-between sm:justify-between">
                        <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => editTicket && handleDelete(editTicket.id)}
                            disabled={isPending}
                        >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Delete
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditTicket(null)}>Cancel</Button>
                            <Button size="sm" onClick={handleSaveEdit} disabled={isPending || !editTitle.trim()}>
                                Save Changes
                            </Button>
                        </div>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
