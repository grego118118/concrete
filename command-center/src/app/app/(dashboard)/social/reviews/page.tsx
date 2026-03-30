import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Star, MessageSquareOff } from "lucide-react";

export default function ReviewsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Review Management</h1>
                    <p className="text-muted-foreground">Monitor and respond to customer feedback.</p>
                </div>
                <Button variant="outline">
                    <Send className="mr-2 h-4 w-4" />
                    Send Review Request
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Google Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold text-muted-foreground/40">—</span>
                            <div className="flex pb-2 text-gray-200">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5" />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Connect Google Business Profile to see your rating</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Facebook Rating</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-end gap-2">
                            <span className="text-4xl font-bold text-muted-foreground/40">—</span>
                            <div className="flex pb-2 text-gray-200">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className="w-5 h-5" />
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">Connect Facebook to see your rating</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                    <MessageSquareOff className="h-10 w-10 text-muted-foreground/40" />
                    <p className="text-sm font-medium text-muted-foreground">No reviews yet</p>
                    <p className="text-xs text-muted-foreground max-w-sm">
                        Connect your Google Business Profile and Facebook accounts in{" "}
                        <a href="/app/social/settings" className="underline underline-offset-2 hover:text-blue-600">
                            Settings
                        </a>{" "}
                        to see and respond to reviews here.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
