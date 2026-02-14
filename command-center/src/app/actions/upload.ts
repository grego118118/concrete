'use server'

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { put } from "@vercel/blob";
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

export async function uploadFile(formData: FormData) {
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    const arrayBuffer = await file.arrayBuffer();
    let buffer = Buffer.from(new Uint8Array(arrayBuffer));
    let fileName = file.name;
    let contentType = file.type;

    const logFile = path.join(process.cwd(), 'upload-logs.txt');
    const log = (msg: string) => {
        const time = new Date().toISOString();
        fs.appendFileSync(logFile, `[${time}] ${msg}\n`);
    };

    log(`Initial: ${fileName}, ${buffer.length} bytes, ${contentType}`);

    // Server-side HEIC conversion using sharp
    if (fileName.toLowerCase().endsWith('.heic') || contentType === 'image/heic') {
        try {
            log(`Converting HEIC to JPG: ${fileName}`);

            // Auto-rotate based on EXIF and convert to JPEG
            const startTime = Date.now();
            const converted = await sharp(buffer)
                .rotate()
                .toFormat('jpeg', { quality: 85 })
                .toBuffer();
            const duration = Date.now() - startTime;

            log(`Conversion success in ${duration}ms. New size: ${converted.length} bytes`);

            buffer = converted as any;
            fileName = fileName.replace(/\.[^/.]+$/, "") + ".jpg";
            contentType = "image/jpeg";
        } catch (error: any) {
            log(`Conversion failed: ${error.message || error}`);
            // Fallback: original HEIC remains in 'buffer'
        }
    }

    const blob = await put(fileName, buffer, {
        access: "public",
        contentType,
    });

    log(`Upload successful: ${blob.url}`);

    return blob;
}

export async function addPhotoToJob(jobId: string, url: string, caption?: string) {
    await db.photo.create({
        data: {
            url,
            caption: caption || "Job site photo",
            type: "JOB_SITE",
            jobId
        }
    });

    revalidatePath(`/crm/jobs/${jobId}`);
}

export async function addPhotoToQuote(quoteId: string, url: string, caption?: string) {
    await db.photo.create({
        data: {
            url,
            caption: caption || "Pre-sale site photo",
            type: "BEFORE",
            quoteId
        }
    });

    revalidatePath(`/crm/quotes/${quoteId}`);
}
