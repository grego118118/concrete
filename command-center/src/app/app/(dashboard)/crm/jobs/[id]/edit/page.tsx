import { getJob } from "@/app/actions/jobs";
import { notFound } from "next/navigation";
import { EditJobForm } from "./edit-job-form";

export default async function EditJobPage({ params }: { params: { id: string } }) {
    const job = await getJob(params.id);

    if (!job) return notFound();

    return <EditJobForm job={job as any} />;
}
