'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createJob(formData: FormData) {
    const customerId = formData.get("customerId") as string
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const scheduledDate = formData.get("scheduledDate") as string // "YYYY-MM-DD"
    const photoUrls = formData.getAll("photoUrls") as string[]

    // Ensure business exists
    let business = await db.business.findFirst()
    if (!business) {
        business = await db.business.create({
            data: {
                name: "TradeOps Demo",
                brandKit: {}
            }
        })
    }

    const job = await db.job.create({
        data: {
            title,
            description,
            status: "SCHEDULED" as any, // Default status
            scheduledAt: scheduledDate ? new Date(scheduledDate) : null,
            customer: {
                connect: { id: customerId }
            },
            business: {
                connect: { id: business.id }
            },
            photos: {
                create: photoUrls.map(url => ({
                    url,
                    caption: "Upload at creation",
                    type: "JOB_SITE"
                }))
            }
        }
    })

    revalidatePath("/app/crm/jobs")
    redirect("/app/crm/jobs")
}

export async function getJobs() {
    return await db.job.findMany({
        include: {
            customer: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export async function getCustomersForSelect() {
    // Helper to populate the select dropdown
    return await db.customer.findMany({
        select: { id: true, name: true },
        orderBy: { createdAt: 'desc' }
    })
}

export async function getJob(id: string) {
    return await db.job.findUnique({
        where: { id },
        include: {
            customer: true,
            photos: true,
            parts: true,
            quote: {
                include: {
                    items: true,
                    invoice: true,
                }
            }
        }
    })
}

export async function updateJob(id: string, formData: FormData) {
    const title = formData.get("title") as string
    const status = formData.get("status") as string
    const description = formData.get("description") as string
    const scheduledDate = formData.get("scheduledDate") as string
    const overageItemsRaw = formData.get("overageItems") as string | null

    const previousJob = await db.job.findUnique({
        where: { id },
        select: { status: true }
    })

    await db.job.update({
        where: { id },
        data: {
            title,
            description,
            status: status as any,
            scheduledAt: scheduledDate ? new Date(scheduledDate) : null,
            completedAt: status === 'COMPLETED' && previousJob?.status !== 'COMPLETED' ? new Date() : undefined,
        }
    })

    // Trigger completion invoice when status changes to COMPLETED
    if (status === 'COMPLETED' && previousJob?.status !== 'COMPLETED') {
        const overageItems = overageItemsRaw ? JSON.parse(overageItemsRaw) : []
        import('@/lib/invoices/completion-invoice')
            .then(({ sendCompletionInvoice }) => sendCompletionInvoice(id, overageItems))
            .catch(err => console.error('[updateJob] Completion invoice failed:', err))
    }

    revalidatePath("/app/crm/jobs")
    redirect("/app/crm/jobs")
}

export async function deleteJob(id: string) {
    await db.job.delete({
        where: { id }
    })

    revalidatePath("/app/crm/jobs")
}
