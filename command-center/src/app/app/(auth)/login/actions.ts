
"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn("credentials", formData, { redirectTo: '/app' })
    } catch (error: any) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }
        // Next.js uses specific errors for redirects (NEXT_REDIRECT)
        // If it's a redirect, we MUST rethrow it so Next.js can handle the navigation
        if (error?.message && error.message.includes('NEXT_REDIRECT')) {
            throw error;
        }
        if (error?.name === 'RedirectError') {
            throw error;
        }

        console.error("Login Error:", error);
        return `Error: ${error?.message || "Something went wrong"}`;
    }
    return undefined;
}

export async function sendMagicLink(
    prevState: string | undefined,
    formData: FormData
) {
    try {
        await signIn("nodemailer", formData, { redirectTo: '/app' })
    } catch (error) {
        throw error
    }
    return undefined
}
