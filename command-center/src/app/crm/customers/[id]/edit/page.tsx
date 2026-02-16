import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getCustomer, updateCustomer } from "@/app/actions/customers";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EditCustomerPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const customer = await getCustomer(params.id);

    if (!customer) {
        redirect("/crm/customers");
    }

    const updateCustomerWithId = updateCustomer.bind(null, customer.id);

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Edit Customer</h1>
                <p className="text-muted-foreground">Update customer details.</p>
            </div>

            <form action={updateCustomerWithId} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" name="name" defaultValue={customer.name} required />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" defaultValue={customer.email} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" name="phone" type="tel" defaultValue={customer.phone || ''} required />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" defaultValue={customer.address || ''} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="source">Lead Source</Label>
                    <Input id="source" name="source" defaultValue={customer.leadSource} placeholder="e.g. Google, Referral" />
                </div>

                <div className="flex justify-end gap-4">
                    <Link href="/crm/customers">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                    <Button type="submit">Save Changes</Button>
                </div>
            </form>
        </div>
    );
}
