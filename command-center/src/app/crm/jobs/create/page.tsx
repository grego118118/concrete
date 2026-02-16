import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

import { createJob, getCustomersForSelect } from "@/app/actions/jobs";
import { JobAreaCalculator } from "@/components/crm/job-area-calculator";
import { PhotoUploader } from "@/components/crm/photo-uploader";

export default async function CreateJobPage({ searchParams }: { searchParams: { customerId?: string } }) {
    const customers = await getCustomersForSelect();
    const defaultCustomerId = searchParams.customerId;
    return (
        <form action={createJob} className="max-w-5xl mx-auto space-y-8 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Schedule New Job</h1>
                    <p className="text-muted-foreground">Detailed project scoping and scheduling for Pioneer Concrete Coatings.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/crm/jobs">
                        <Button variant="outline" type="button">Cancel</Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-5">
                <div className="lg:col-span-3 space-y-8">
                    <JobAreaCalculator />

                    <Card>
                        <CardHeader>
                            <CardTitle>Initial Photo Board</CardTitle>
                            <CardDescription>Upload before photos or site conditions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <PhotoUploader />
                        </CardContent>
                    </Card>

                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-xs flex items-start gap-2">
                        <span className="font-bold">Note:</span>
                        Calculations and photos here help determine the project scope. Final data will be saved to the Production Log once the job is created.
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <Card className="h-full flex flex-col">
                        <CardHeader className="bg-slate-50 border-b">
                            <CardTitle className="text-xl">Job Logistics</CardTitle>
                            <CardDescription>Customer and scheduling details.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6 flex-1">
                            <div className="grid gap-2">
                                <Label htmlFor="customer" className="font-bold">Customer</Label>
                                <Select name="customerId" defaultValue={defaultCustomerId} required>
                                    <SelectTrigger className="h-11">
                                        <SelectValue placeholder="Select a customer" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {customers.map(c => (
                                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="title" className="font-bold">Job Title</Label>
                                <Input id="title" name="title" placeholder="e.g. 2-Day Garage Floor Coating" className="h-11" required />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="date" className="font-bold">Estimated Start Date</Label>
                                <Input id="date" name="scheduledDate" type="date" className="h-11" />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description" className="font-bold">Special Instructions</Label>
                                <Textarea id="description" name="description" placeholder="Access codes, gate instructions, or prep notes..." className="min-h-[120px]" />
                            </div>
                        </CardContent>
                        <CardFooter className="bg-slate-50 border-t p-6">
                            <Button type="submit" className="w-full h-12 bg-blue-600 hover:bg-blue-700 font-bold text-lg">
                                Create Job & Launch Production
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </form>
    );
}
