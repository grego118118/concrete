'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getTickets() {
    return db.ticket.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function createTicket(data: {
    title: string;
    description?: string;
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    createdBy: string;
}) {
    await db.ticket.create({ data });
    revalidatePath('/app');
}

export async function updateTicketStatus(id: string, status: 'OPEN' | 'IN_PROGRESS' | 'DONE') {
    await db.ticket.update({ where: { id }, data: { status } });
    revalidatePath('/app');
}

export async function deleteTicket(id: string) {
    await db.ticket.delete({ where: { id } });
    revalidatePath('/app');
}
