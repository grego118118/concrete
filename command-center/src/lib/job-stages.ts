export interface JobStageData {
    status: string;
    scheduledAt: Date | null;
    quote?: {
        status: string;
        invoice?: {
            status: string;
            completionSentAt: Date | null;
        } | null;
    } | null;
}

export const STAGES = [
    { id: 1, label: 'Quote Sent',     short: 'Quoted'     },
    { id: 2, label: 'Deposit Paid',   short: 'Deposit'    },
    { id: 3, label: 'Scheduled',      short: 'Scheduled'  },
    { id: 4, label: 'In Progress',    short: 'In Progress'},
    { id: 5, label: 'Work Complete',  short: 'Complete'   },
    { id: 6, label: 'Invoiced',       short: 'Invoiced'   },
    { id: 7, label: 'Paid in Full',   short: 'Paid'       },
] as const;

export type StageId = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export function getJobStage(job: JobStageData): StageId {
    const invoiceStatus = job.quote?.invoice?.status;
    const completionSentAt = job.quote?.invoice?.completionSentAt;

    if (invoiceStatus === 'PAID') return 7;
    if (completionSentAt) return 6;
    if (job.status === 'COMPLETED') return 5;
    if (job.status === 'IN_PROGRESS') return 4;
    if (job.scheduledAt) return 3;
    if (invoiceStatus === 'DEPOSIT_PAID' || invoiceStatus === 'SENT') return 2;
    return 1;
}

export function stagePillColor(stage: StageId): string {
    if (stage === 7) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    if (stage >= 5) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (stage >= 2) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-600 border-slate-200';
}
