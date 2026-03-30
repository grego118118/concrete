
"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn("credentials", {
            email: formData.get("email") as string,
            password: formData.get("password") as string,
            redirectTo: "/app",
        });
    } catch (error: any) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return "Something went wrong."
            }
        }

        // NEXT_REDIRECT is the convention for successful auth/redirect in Next.js Server Actions
        // We MUST rethrow it so the Next.js router handles the navigation
        throw error;
    }
    return undefined;
}
