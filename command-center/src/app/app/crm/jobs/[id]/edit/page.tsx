import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getJob, updateJob } from "@/app/actions/jobs";
import { redirect } from "next/navigation";
import Link from "next/link";
import { DeleteJobButton } from "./delete-job-button";

export default async function EditJobPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const job = await getJob(params.id);

    if (!job) {
        redirect("/crm/jobs");
    }

    const updateJobWithId = updateJob.bind(null, job.id);

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold">Edit Job</h1>
                <p className="text-muted-foreground">Update job details for {job.customer.name}.</p>
            </div>

            <form action={updateJobWithId} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input id="title" name="title" defaultValue={job.title} required />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Scheduled Date</Label>
                    <Input id="scheduledDate" name="scheduledDate" type="date" defaultValue={job.scheduledAt ? job.scheduledAt.toISOString().split('T')[0] : ''} />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select name="status" defaultValue={job.status}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="SCHEDULED">Scheduled</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" defaultValue={job.description || ''} />
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                    <DeleteJobButton jobId={job.id} />
                    <div className="flex gap-4">
                        <Link href="/crm/jobs">
                            <Button variant="outline" type="button">Cancel</Button>
                        </Link>
                        <Button type="submit">Save Changes</Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
