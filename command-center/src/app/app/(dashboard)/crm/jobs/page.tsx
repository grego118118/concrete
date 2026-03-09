import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Calendar as CalendarIcon, List } from "lucide-react";
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import JobCalendar from "@/components/crm/job-calendar";

import { getJobs } from "@/app/actions/jobs";

export default async function JobsPage() {
    const jobs = await getJobs();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'SCHEDULED': return 'bg-blue-600 hover:bg-blue-700'; // Default shadcn blue
            case 'IN_PROGRESS': return 'bg-amber-600 hover:bg-amber-700';
            case 'COMPLETED': return 'bg-green-600 hover:bg-green-700';
            case 'CANCELLED': return 'bg-slate-600 hover:bg-slate-700';
            default: return 'bg-slate-600';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
                    <p className="text-muted-foreground">Track active work orders and history.</p>
                </div>
                <Link href="/app/crm/jobs/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        New Job
                    </Button>
                </Link>
            </div>

            <Tabs defaultValue="list" className="w-full">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="list">
                            <List className="mr-2 h-4 w-4" />
                            List View
                        </TabsTrigger>
                        <TabsTrigger value="calendar">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Calendar View
                        </TabsTrigger>
                    </TabsList>

                    <div className="relative w-full max-w-sm hidden md:block">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search jobs..."
                            className="pl-8"
                        />
                    </div>
                </div>

                <TabsContent value="list" className="mt-4">
                    <div className="rounded-md border bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Job ID</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Customer</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {jobs.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            No jobs found. Create one to get started.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    jobs.map((job) => (
                                        <TableRow key={job.id}>
                                            <TableCell className="font-mono">#{job.id.slice(-4)}</TableCell>
                                            <TableCell className="font-medium">{job.title}</TableCell>
                                            <TableCell>
                                                <Link href={`/app/crm/customers/${job.customerId}`} className="hover:underline text-primary">
                                                    {job.customer.name}
                                                </Link>
                                            </TableCell>
                                            <TableCell className="flex items-center gap-2">
                                                <CalendarIcon className="h-3 w-3 text-muted-foreground" />
                                                {job.scheduledAt ? new Date(job.scheduledAt).toLocaleDateString() : 'Unscheduled'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/app/crm/jobs/${job.id}/edit`}>
                                                    <Button variant="ghost" size="sm">Manage</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>

                <TabsContent value="calendar" className="mt-4">
                    <JobCalendar jobs={jobs} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
