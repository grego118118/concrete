"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { deleteCustomers } from "@/app/actions/customers";

interface Customer {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    leadSource: string | null;
}

export function CustomerTable({ customers }: { customers: Customer[] }) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isPending, startTransition] = useTransition();

    const allSelected = customers.length > 0 && selected.size === customers.length;
    const someSelected = selected.size > 0 && selected.size < customers.length;

    function toggleAll() {
        if (allSelected) {
            setSelected(new Set());
        } else {
            setSelected(new Set(customers.map((c) => c.id)));
        }
    }

    function toggleOne(id: string) {
        setSelected((prev) => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }

    function handleBulkDelete() {
        const ids = Array.from(selected);
        startTransition(async () => {
            await deleteCustomers(ids);
            setSelected(new Set());
        });
    }

    return (
        <>
            {selected.size > 0 && (
                <div className="flex items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-2">
                    <span className="text-sm font-medium">
                        {selected.size} customer{selected.size !== 1 ? "s" : ""} selected
                    </span>
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="destructive"
                                size="sm"
                                disabled={isPending}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                {isPending ? "Deleting..." : `Delete Selected (${selected.size})`}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Customers</AlertDialogTitle>
                                <AlertDialogDescription>
                                    Are you sure you want to delete {selected.size} customer{selected.size !== 1 ? "s" : ""}?
                                    This action cannot be undone and will remove all associated data.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleBulkDelete}
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            )}

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[40px]">
                                <Checkbox
                                    checked={allSelected ? true : someSelected ? "indeterminate" : false}
                                    onCheckedChange={toggleAll}
                                    aria-label="Select all customers"
                                />
                            </TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Lead Source</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {customers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center h-24 text-muted-foreground">
                                    No customers found. Add one to get started.
                                </TableCell>
                            </TableRow>
                        ) : (
                            customers.map((customer) => (
                                <TableRow
                                    key={customer.id}
                                    data-state={selected.has(customer.id) ? "selected" : undefined}
                                >
                                    <TableCell>
                                        <Checkbox
                                            checked={selected.has(customer.id)}
                                            onCheckedChange={() => toggleOne(customer.id)}
                                            aria-label={`Select ${customer.name}`}
                                        />
                                    </TableCell>
                                    <TableCell className="font-medium">{customer.name}</TableCell>
                                    <TableCell>{customer.email}</TableCell>
                                    <TableCell>{customer.phone}</TableCell>
                                    <TableCell>{customer.leadSource}</TableCell>
                                    <TableCell>Active</TableCell>
                                    <TableCell className="text-right flex items-center justify-end gap-2">
                                        <Link href={`/app/crm/customers/${customer.id}/edit`}>
                                            <Button variant="ghost" size="sm">Edit</Button>
                                        </Link>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
