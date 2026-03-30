"use client";

import { useState, useTransition } from "react";
import { Check, Loader2, CalendarDays, PlayCircle, ClipboardCheck, FileText, BadgeCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { STAGES, getJobStage, JobStageData, StageId } from "@/lib/job-stages";
import { advanceJobStatus } from "@/app/actions/jobs";
import Link from "next/link";

interface JobStepperProps {
    job: JobStageData & { id: string; scheduledAt: Date | null };
}

const NEXT_STEP: Record<StageId, {
    title: string;
    description: string;
    action?: { label: string; type: 'link' | 'button'; href?: string; newStatus?: string; icon?: React.ReactNode };
}> = {
    1: {
        title: "Awaiting Deposit",
        description: "The quote has been sent. Waiting for the customer to pay the 50% deposit before scheduling.",
    },
    2: {
        title: "Schedule the Job",
        description: "Deposit confirmed! Set a date to lock this job into the calendar.",
        action: { label: "Set Scheduled Date", type: "link", icon: <CalendarDays className="h-4 w-4 mr-2" /> },
    },
    3: {
        title: "Ready to Start",
        description: "Job is on the calendar. Mark as In Progress when the crew arrives on site.",
        action: { label: "Mark In Progress", type: "button", newStatus: "IN_PROGRESS", icon: <PlayCircle className="h-4 w-4 mr-2" /> },
    },
    4: {
        title: "Finish Strong",
        description: "Work is underway. When the job is done, mark it complete to send the final invoice.",
        action: { label: "Mark as Complete", type: "link", icon: <ClipboardCheck className="h-4 w-4 mr-2" /> },
    },
    5: {
        title: "Final Invoice Sending",
        description: "Work is complete. The final balance invoice is being sent to the customer automatically.",
    },
    6: {
        title: "Awaiting Final Payment",
        description: "The final invoice has been sent. Waiting for the customer to pay the remaining balance.",
        action: { label: "View Invoice", type: "link", href: "/app/crm/invoices", icon: <FileText className="h-4 w-4 mr-2" /> },
    },
    7: {
        title: "Job Complete!",
        description: "All done — payment received and this job is fully closed out.",
    },
};

function StageNode({ stageNum, currentStage, label }: { stageNum: number; currentStage: StageId; label: string }) {
    const done = stageNum < currentStage;
    const current = stageNum === currentStage;
    const future = stageNum > currentStage;

    return (
        <div className="flex flex-col items-center gap-1.5 min-w-0">
            <div className={`
                flex items-center justify-center w-9 h-9 rounded-full border-2 font-bold text-sm shrink-0 transition-all
                ${done    ? 'bg-emerald-500 border-emerald-500 text-white'                     : ''}
                ${current ? 'bg-blue-600 border-blue-600 text-white ring-4 ring-blue-100'     : ''}
                ${future  ? 'bg-white border-slate-300 text-slate-400'                        : ''}
            `}>
                {done ? <Check className="h-4 w-4 stroke-[3]" /> : stageNum}
            </div>
            <span className={`text-[10px] font-semibold text-center leading-tight max-w-[60px] truncate
                ${done    ? 'text-emerald-600' : ''}
                ${current ? 'text-blue-700'    : ''}
                ${future  ? 'text-slate-400'   : ''}
            `}>
                {label}
            </span>
        </div>
    );
}

function Connector({ done }: { done: boolean }) {
    return (
        <div className={`h-0.5 flex-1 mt-[-18px] mx-1 transition-colors ${done ? 'bg-emerald-400' : 'bg-slate-200'}`} />
    );
}

export function JobStepper({ job }: JobStepperProps) {
    const currentStage = getJobStage(job);
    const step = NEXT_STEP[currentStage];
    const [isPending, startTransition] = useTransition();

    const handleAdvance = (newStatus: string) => {
        startTransition(async () => {
            await advanceJobStatus(job.id, newStatus);
        });
    };

    const actionHref = step.action?.type === 'link'
        ? (step.action.href ?? `/app/crm/jobs/${job.id}/edit`)
        : undefined;

    return (
        <div className="space-y-4">
            {/* Stepper track */}
            <div className="overflow-x-auto pb-1">
                <div className="flex items-start min-w-[480px]">
                    {STAGES.map((s, i) => (
                        <div key={s.id} className="flex items-start flex-1 min-w-0">
                            <StageNode stageNum={s.id} currentStage={currentStage} label={s.short} />
                            {i < STAGES.length - 1 && (
                                <Connector done={s.id < currentStage} />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Next Step card */}
            <Card className={`border-l-4 ${
                currentStage === 7 ? 'border-l-emerald-500 bg-emerald-50/50' :
                currentStage >= 5 ? 'border-l-amber-400 bg-amber-50/50'     :
                'border-l-blue-500 bg-blue-50/50'
            }`}>
                <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 px-5">
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            {currentStage === 7
                                ? <BadgeCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                                : <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                                    Step {currentStage} of 7 — Next Up
                                  </span>
                            }
                        </div>
                        <p className="font-semibold text-slate-900">{step.title}</p>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>

                    {step.action && (
                        step.action.type === 'link' ? (
                            <Link href={actionHref!} className="shrink-0">
                                <Button size="sm" className="w-full sm:w-auto">
                                    {step.action.icon}{step.action.label}
                                </Button>
                            </Link>
                        ) : (
                            <Button
                                size="sm"
                                className="shrink-0"
                                disabled={isPending}
                                onClick={() => handleAdvance(step.action!.newStatus!)}
                            >
                                {isPending
                                    ? <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    : step.action.icon
                                }
                                {isPending ? "Updating..." : step.action.label}
                            </Button>
                        )
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
