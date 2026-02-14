'use server'

import { db } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getBusinessSettings() {
    const business = await db.business.findFirst()
    if (!business) {
        return await db.business.create({
            data: {
                name: "My Business",
                brandKit: {
                    email: "",
                    address: "",
                    phone: ""
                }
            }
        })
    }
    return business
}

export async function updateBusinessSettings(formData: FormData) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const address = formData.get("address") as string
    const phone = formData.get("phone") as string

    const validBrandKit = {
        email,
        address,
        phone
    }

    const business = await db.business.findFirst()

    if (business) {
        await db.business.update({
            where: { id: business.id },
            data: {
                name,
                brandKit: validBrandKit
            }
        })
    }

    revalidatePath("/crm/settings")
    return { success: true }
}
