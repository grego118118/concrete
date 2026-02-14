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

    revalidatePath("/crm/jobs")
    redirect("/crm/jobs")
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
        orderBy: { name: 'asc' }
    })
}

export async function getJob(id: string) {
    return await db.job.findUnique({
        where: { id },
        include: {
            customer: true,
            photos: true,
            parts: true
        }
    })
}

export async function updateJob(id: string, formData: FormData) {
    const title = formData.get("title") as string
    const status = formData.get("status") as string
    const description = formData.get("description") as string
    const scheduledDate = formData.get("scheduledDate") as string // "YYYY-MM-DD"

    await db.job.update({
        where: { id },
        data: {
            title,
            description,
            status: status as any,
            scheduledAt: scheduledDate ? new Date(scheduledDate) : null
        }
    })

    revalidatePath("/crm/jobs")
    redirect("/crm/jobs")
}

export async function deleteJob(id: string) {
    await db.job.delete({
        where: { id }
    })

    revalidatePath("/crm/jobs")
}
