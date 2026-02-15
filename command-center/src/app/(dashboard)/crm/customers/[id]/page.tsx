import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Mail, Phone, MapPin, Calendar, Plus } from "lucide-react";
import Link from "next/link";
import { getCustomer } from "@/app/actions/customers";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";

export default async function CustomerDetailPage({ params }: { params: { id: string } }) {
    const customer = await getCustomer(params.id);

    if (!customer) {
        return notFound();
    }

    const initials = customer.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16">
                        <AvatarFallback className="text-xl bg-blue-100 text-blue-600">{initials}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{customer.name}</h1>
                        <div className="flex items-center gap-3 text-muted-foreground text-sm mt-1">
                            <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" /> {customer.email}</span>
                            {customer.phone && (
                                <>
                                    <span className="text-slate-300">|</span>
                                    <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" /> {customer.phone}</span>
                                </>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <Link href={`/crm/customers/${customer.id}/edit`} className="flex-1 md:flex-none">
                        <Button variant="outline" className="w-full">Edit Profile</Button>
                    </Link>
                    <Link href={`/crm/jobs/create?customerId=${customer.id}`} className="flex-1 md:flex-none">
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> New Job
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Contact & Area</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-medium">Primary Address</p>
                                    <p className="text-muted-foreground">{customer.address || "No address provided"}</p>
                                    {customer.city && (
                                        <p className="text-muted-foreground">{customer.city}, {customer.state} {customer.zip}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <div className="text-sm">
                                    <p className="font-medium">Customer Since</p>
                                    <p className="text-muted-foreground">{new Date(customer.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Lead Source</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Badge variant="secondary" className="bg-slate-100">{customer.leadSource || "Manual Entry"}</Badge>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground italic">
                                {customer.notes || "No internal notes for this customer."}
                            </p>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Tabs defaultValue="jobs">
                        <TabsList className="bg-white border w-full justify-start h-12 p-1">
                            <TabsTrigger value="jobs" className="flex-1 md:flex-none">Job History ({customer.jobs.length})</TabsTrigger>
                            <TabsTrigger value="quotes" className="flex-1 md:flex-none">Quotes ({customer.quotes.length})</TabsTrigger>
                            <TabsTrigger value="billing" className="flex-1 md:flex-none">Billing</TabsTrigger>
                        </TabsList>

                        <TabsContent value="jobs" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Work Orders</CardTitle>
                                    <CardDescription>All scheduled and completed services for this location.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {customer.jobs.length === 0 ? (
                                        <div className="text-center py-8">
                                            <p className="text-muted-foreground">No jobs scheduled yet.</p>
                                            <Link href={`/crm/jobs/create?customerId=${customer.id}`} className="mt-2 inline-block">
                                                <Button variant="link" className="text-blue-600">Schedule the first job</Button>
                                            </Link>
                                        </div>
                                    ) : (
                                        <div className="divide-y">
                                            {customer.jobs.map((job) => (
                                                <div key={job.id} className="py-4 flex items-center justify-between group">
                                                    <div>
                                                        <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                                                            <Link href={`/crm/jobs/${job.id}/edit`}>{job.title}</Link>
                                                        </h4>
                                                        <div className="text-sm text-muted-foreground flex items-center gap-3 mt-1">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3.5 w-3.5" />
                                                                {job.scheduledAt ? new Date(job.scheduledAt).toLocaleDateString() : "TBD"}
                                                            </span>
                                                            <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">{job.status}</Badge>
                                                        </div>
                                                    </div>
                                                    <Link href={`/crm/jobs/${job.id}/edit`}>
                                                        <Button variant="ghost" size="sm">Manage</Button>
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="quotes" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quotes & Estimates</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {customer.quotes.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No proposals generated yet.</p>
                                    ) : (
                                        <div className="divide-y">
                                            {customer.quotes.map((quote) => (
                                                <div key={quote.id} className="py-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold">Estimate #{quote.number}</p>
                                                        <p className="text-sm text-muted-foreground">${quote.total.toString()}</p>
                                                    </div>
                                                    <Badge>{quote.status}</Badge>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="billing" className="space-y-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Invoices</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {customer.invoices.length === 0 ? (
                                        <p className="text-muted-foreground text-center py-8">No billing history found.</p>
                                    ) : (
                                        <div className="divide-y">
                                            {customer.invoices.map((inv) => (
                                                <div key={inv.id} className="py-4 flex items-center justify-between">
                                                    <div>
                                                        <p className="font-semibold">INV-{inv.number}</p>
                                                        <p className="text-sm text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="font-bold">${inv.amount.toString()}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{inv.status}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
