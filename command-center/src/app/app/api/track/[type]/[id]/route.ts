import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// 1x1 transparent GIF pixel
const PIXEL = Buffer.from(
    'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
    'base64'
);

export async function GET(
    request: NextRequest,
    { params }: { params: { type: string; id: string } }
) {
    const { type, id } = params;

    try {
        if (type === 'quote') {
            const quote = await db.quote.findUnique({ where: { id }, select: { openedAt: true } });
            if (quote && !quote.openedAt) {
                await db.quote.update({ where: { id }, data: { openedAt: new Date() } });
            }
        } else if (type === 'invoice') {
            const invoice = await db.invoice.findUnique({ where: { id }, select: { openedAt: true } });
            if (invoice && !invoice.openedAt) {
                await db.invoice.update({ where: { id }, data: { openedAt: new Date() } });
            }
        }
    } catch {
        // Never fail — just serve the pixel
    }

    return new NextResponse(PIXEL, {
        status: 200,
        headers: {
            'Content-Type': 'image/gif',
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
        },
    });
}
