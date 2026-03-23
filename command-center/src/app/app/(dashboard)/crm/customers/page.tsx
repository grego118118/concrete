import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";
import Link from "next/link";

import { getCustomers } from "@/app/actions/customers";
import { CustomerSort } from "./customer-sort";
import { CustomerTable } from "./customer-table";

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ sort?: string }> }) {
    const params = await searchParams;
    const sort = params.sort || 'name';
    const customers = await getCustomers(sort);
    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground">Manage your client base and leads.</p>
                </div>
                <Link href="/app/crm/customers/create">
                    <Button>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Customer
                    </Button>
                </Link>
            </div>

            <div className="flex items-center justify-between gap-2">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search customers..."
                        className="pl-8"
                    />
                </div>
                <CustomerSort currentSort={sort} />
            </div>

            <CustomerTable customers={customers} />
        </div>
    );
}
