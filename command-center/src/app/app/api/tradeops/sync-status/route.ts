
import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const taskName = searchParams.get('taskName');

    if (!taskName) return NextResponse.json({ error: 'Missing taskName' }, { status: 400 });

    const log = await db.syncLog.findFirst({
        where: { taskName },
        orderBy: { startedAt: 'desc' },
    });

    if (!log) {
        return NextResponse.json({ status: "PENDING" });
    }

    return NextResponse.json(log);
}
