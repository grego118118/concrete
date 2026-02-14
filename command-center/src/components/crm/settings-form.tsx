"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { updateBusinessSettings } from "@/app/actions/settings"
import { useTransition, useRef } from "react"
import { toast } from "sonner"

interface SettingsFormProps {
    initialData: {
        name: string;
        brandKit: any;
    }
}

export function SettingsForm({ initialData }: SettingsFormProps) {
    const [isPending, startTransition] = useTransition()
    const formRef = useRef<HTMLFormElement>(null)

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()

        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
            try {
                const result = await updateBusinessSettings(formData)
                if (result.success) {
                    toast.success("Settings updated successfully")
                }
            } catch (error) {
                console.error("Failed to update settings:", error)
                toast.error("Failed to update settings")
            }
        })
    }

    return (
        <form ref={formRef} onSubmit={handleSubmit}>
            <Card>
                <CardHeader>
                    <CardTitle>Company Profile</CardTitle>
                    <CardDescription>This information will appear on your invoices and quotes.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Company Name</Label>
                        <Input id="name" name="name" defaultValue={initialData.name} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Support Email</Label>
                        <Input
                            id="email"
                            name="email"
                            defaultValue={initialData.brandKit?.email || ""}
                            placeholder="support@example.com"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number</Label>
                        <Input
                            id="phone"
                            name="phone"
                            defaultValue={initialData.brandKit?.phone || ""}
                            placeholder="(555) 123-4567"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            name="address"
                            defaultValue={initialData.brandKit?.address || ""}
                            placeholder="123 Business St"
                        />
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" disabled={isPending}>
                        {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    )
}
