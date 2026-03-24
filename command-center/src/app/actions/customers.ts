'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createCustomer(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const source = formData.get("source") as string

    // TODO: Handle Business ID dynamically. For now, hardcoding or creating default.
    // We need a business to attach to.
    // In a real app, we'd get this from the session. 
    // For this v0, we might need to query the first business or create one if missing.

    let business = await db.business.findFirst()
    if (!business) {
        business = await db.business.create({
            data: {
                name: "TradeOps Demo",
                brandKit: {}
            }
        })
    }

    await db.customer.create({
        data: {
            name,
            email,
            phone,
            address,
            leadSource: source || "Direct",
            businessId: business.id
        }
    })

    revalidatePath("/app/crm/customers")
    revalidatePath("/app/crm/quotes", "layout")
    revalidatePath("/app/crm/jobs", "layout")
    redirect("/app/crm/customers")
}

export async function getCustomers(sort: string = 'newest', search?: string) {
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

    const query: any = {
        where: {
            businessId: business.id
        },
        orderBy: sort === 'newest' ? { createdAt: 'desc' } : { name: 'asc' }
    }

    if (search) {
        query.where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } },
        ]
    }

    return await db.customer.findMany(query)
}

export async function getCustomer(id: string) {
    return await db.customer.findUnique({
        where: { id },
        include: {
            jobs: true,
            quotes: true,
            invoices: true
        }
    })
}

export async function updateCustomer(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string
    const source = formData.get("source") as string

    await db.customer.update({
        where: { id },
        data: {
            name,
            email,
            phone,
            address,
            leadSource: source
        }
    })

    revalidatePath("/app/crm/customers")
    revalidatePath("/app/crm/quotes", "layout")
    revalidatePath("/app/crm/jobs", "layout")
    redirect("/app/crm/customers")
}

export async function deleteCustomer(id: string) {
    await db.customer.delete({
        where: { id }
    })

    revalidatePath("/app/crm/customers")
    revalidatePath("/app/crm/quotes", "layout")
    revalidatePath("/app/crm/jobs", "layout")
}

export async function deleteCustomers(ids: string[]) {
    if (ids.length === 0) return

    await db.customer.deleteMany({
        where: { id: { in: ids } }
    })

    revalidatePath("/app/crm/customers")
    revalidatePath("/app/crm/quotes", "layout")
    revalidatePath("/app/crm/jobs", "layout")
}
