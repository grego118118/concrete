
import { Suspense } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { AlertCircle } from "lucide-react"

enum Error {
    Configuration = "Configuration",
}

const errorMap = {
    [Error.Configuration]: (
        <p>
            There is a problem with the server configuration.
            Check if your environmental variables are correct.
        </p>
    ),
    default: (
        <p>
            An unexpected error occurred during authentication.
            Please try again later.
        </p>
    ),
}

function ErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error") as Error

    return (
        <Card className="mx-auto max-w-sm">
            <CardHeader>
                <div className="flex items-center gap-2">
                    <AlertCircle className="h-6 w-6 text-destructive" />
                    <CardTitle className="text-2xl">Auth Error</CardTitle>
                </div>
                <CardDescription>
                    {error || "An error occurred"}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-sm text-muted-foreground">
                    {errorMap[error] || errorMap.default}
                </div>
            </CardContent>
            <CardFooter>
                <Button asChild className="w-full">
                    <Link href="/app/login">
                        Back to Login
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    )
}

export default function AuthErrorPage() {
    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Suspense fallback={<div>Loading...</div>}>
                <ErrorContent />
            </Suspense>
        </div>
    )
}
