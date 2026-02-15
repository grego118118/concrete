
"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn("credentials", formData)
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }
        throw error
    }
    return undefined
}

export async function sendMagicLink(
    prevState: string | undefined,
    formData: FormData
) {
    try {
        await signIn("nodemailer", formData)
    } catch (error) {
        throw error
    }
    return undefined
}
