
"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { authenticate } from "./actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"

function LoginButton({ text }: { text: string }) {
    const { pending } = useFormStatus()
    return (
        <Button aria-disabled={pending} type="submit" className="w-full">
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {text}
        </Button>
    )
}

export function LoginForm() {
    const [errorMessage, dispatch] = useActionState(authenticate, undefined)

    return (
        <form action={dispatch} className="grid gap-4 py-4">
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                />
            </div>
            <LoginButton text="Login with Password" />
            <div
                className="flex h-8 items-end space-x-1"
                aria-live="polite"
                aria-atomic="true"
            >
                {errorMessage && (
                    <>
                        <p className="text-sm text-red-500">{errorMessage}</p>
                    </>
                )}
            </div>
        </form>
    )
}
