import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCustomer } from "@/app/actions/customers";
import { AddressAutocomplete } from "@/components/address-autocomplete";
import Link from "next/link";

export default function CreateCustomerPage() {
    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Add Customer</h1>
                <p className="text-muted-foreground">Create a new customer profile.</p>
            </div>

            <form action={createCustomer}>
                <Card>
                    <CardHeader>
                        <CardTitle>Customer Details</CardTitle>
                        <CardDescription>Enter the customer's contact information.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" placeholder="John Doe" required />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="phone">Phone</Label>
                                <Input id="phone" name="phone" type="tel" placeholder="(555) 123-4567" />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="address">Project Address</Label>
                            <AddressAutocomplete id="address" name="address" placeholder="123 Main St..." />
                            <p className="text-[0.8rem] text-muted-foreground">
                                We serve Western & Central MA (Hampden, Hampshire, Franklin, Worcester counties) and Northern CT
                            </p>
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="source">Lead Source</Label>
                            <Input id="source" name="source" placeholder="Google, Referral, etc." />
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Link href="/crm/customers">
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit">Save Customer</Button>
                    </CardFooter>
                </Card>
            </form>
        </div>
    );
}
