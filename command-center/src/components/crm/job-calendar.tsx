"use client";

import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Job } from '@prisma/client';
import { useRouter } from 'next/navigation';

const localizer = momentLocalizer(moment);

interface JobCalendarProps {
    jobs: Job[];
}

export default function JobCalendar({ jobs }: JobCalendarProps) {
    const router = useRouter();

    const events = jobs
        .filter(job => job.status !== 'CANCELLED' && job.scheduledAt)
        .map(job => ({
            id: job.id,
            title: job.title,
            start: new Date(job.scheduledAt!),
            end: new Date(new Date(job.scheduledAt!).getTime() + (2 * 60 * 60 * 1000)), // Default 2 hours
            allDay: false,
            resource: job
        }));

    return (
        <div className="h-[600px] bg-white p-4 rounded-md border shadow-sm">
            <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectEvent={(event) => router.push(`/crm/jobs/${event.id}/edit`)} // Or detail view
            />
        </div>
    );
}
