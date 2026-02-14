'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getTeamMembers() {
    const business = await db.business.findFirst()
    if (!business) return []

    return await db.user.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: 'desc' }
    })
}

export async function createTeamMember(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as "ADMIN" | "TECHNICIAN" | "OFFICE"

    const business = await db.business.findFirst()
    if (!business) {
        throw new Error("No business found")
    }

    // Check if email already exists
    const existing = await db.user.findUnique({
        where: { email }
    })

    if (existing) {
        throw new Error("A user with this email already exists")
    }

    await db.user.create({
        data: {
            name,
            email,
            role,
            businessId: business.id
        }
    })

    revalidatePath("/crm/settings")
    return { success: true }
}

export async function updateTeamMember(id: string, formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as "ADMIN" | "TECHNICIAN" | "OFFICE"

    // Check if email is being changed and if new email already exists
    const currentMember = await db.user.findUnique({ where: { id } })
    if (currentMember && currentMember.email !== email) {
        const existing = await db.user.findUnique({ where: { email } })
        if (existing) {
            throw new Error("A user with this email already exists")
        }
    }

    await db.user.update({
        where: { id },
        data: { name, email, role }
    })

    revalidatePath("/crm/settings")
    return { success: true }
}

export async function deleteTeamMember(id: string) {
    await db.user.delete({
        where: { id }
    })

    revalidatePath("/crm/settings")
    return { success: true }
}
