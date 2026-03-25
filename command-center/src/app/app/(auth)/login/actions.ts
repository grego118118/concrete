
"use server"

import { signIn } from "@/auth"
import { AuthError } from "next-auth"

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        console.log(`[Auth Action] Attempting signIn for: ${formData.get("email")}`);
        await signIn("credentials", formData, { 
            redirectTo: '/app'
        });
    } catch (error: any) {
        console.error(`[Auth Action] Caught error: ${error?.name} - ${error?.message}`);
        
        if (error instanceof AuthError) {
            console.log("[Auth Action] AuthError type:", error.type);
            switch (error.type) {
                case "CredentialsSignin":
                    return "Invalid credentials."
                default:
                    return `Auth Error: ${error.type}`
            }
        }

        // Next.js uses specific errors for redirects (NEXT_REDIRECT)
        if (error?.message && error.message.includes('NEXT_REDIRECT')) {
            console.log("[Auth Action] Rethrowing NEXT_REDIRECT");
            throw error;
        }
        if (error?.digest && error.digest.includes('NEXT_REDIRECT')) {
            console.log("[Auth Action] Rethrowing NEXT_REDIRECT (via digest)");
            throw error;
        }
        if (error?.name === 'RedirectError') {
            console.log("[Auth Action] Rethrowing RedirectError");
            throw error;
        }

        console.error("[Auth Action] Unknown Fatal Error:", error);
        return `Unexpected Error: ${error?.message || "Check server logs"}`;
    }
    console.log("[Auth Action] Reached end of function without redirect or error");
    return "Login failed to redirect. Please try again.";
}
