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
            customer: true,
            quote: {
                include: {
                    invoice: true,
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    })
}

export async function advanceJobStatus(id: string, newStatus: string) {
    await db.job.update({
        where: { id },
        data: {
            status: newStatus as any,
        }
    })
    revalidatePath(`/app/crm/jobs/${id}`)
    revalidatePath('/app/crm/jobs')
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
    // Must be awaited BEFORE redirect() — redirect() throws NEXT_REDIRECT which
    // terminates the function and abandons any fire-and-forget promises.
    if (status === 'COMPLETED' && previousJob?.status !== 'COMPLETED') {
        const overageItems = overageItemsRaw ? JSON.parse(overageItemsRaw) : []
        try {
            const { sendCompletionInvoice } = await import('@/lib/invoices/completion-invoice')
            await sendCompletionInvoice(id, overageItems)
            console.log(`[updateJob] Completion invoice sent for job ${id}`)
        } catch (err) {
            console.error('[updateJob] Completion invoice failed:', err)
        }
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
