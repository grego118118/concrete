import { STAGES, getJobStage, JobStageData, stagePillColor } from "@/lib/job-stages";

interface JobStagePillProps {
    job: JobStageData;
}

export function JobStagePill({ job }: JobStagePillProps) {
    const stage = getJobStage(job);
    const label = STAGES.find(s => s.id === stage)!.short;

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${stagePillColor(stage)}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${
                stage === 7 ? 'bg-emerald-500' :
                stage >= 5  ? 'bg-amber-500'   :
                stage >= 2  ? 'bg-blue-500'    :
                'bg-slate-400'
            }`} />
            {stage} of 7 · {label}
        </span>
    );
}
