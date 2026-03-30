import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarX, BookOpen } from "lucide-react";
import Link from "next/link";

export default function QueuePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Smart Queue</h1>
                    <p className="text-muted-foreground">Manage scheduled and evergreen content.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline">Queue Settings</Button>
                    <Button asChild>
                        <Link href="/app/social/composer">Add to Queue</Link>
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="scheduled">
                <TabsList>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    <TabsTrigger value="evergreen">Evergreen Library</TabsTrigger>
                </TabsList>

                <TabsContent value="scheduled" className="mt-4">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <CalendarX className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm font-medium text-muted-foreground">No posts scheduled</p>
                            <p className="text-xs text-muted-foreground max-w-xs">
                                Use the Composer to generate and schedule posts to your connected platforms.
                            </p>
                            <Button asChild size="sm" variant="outline" className="mt-2">
                                <Link href="/app/social/composer">Open Composer</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="evergreen" className="mt-4">
                    <Card>
                        <CardContent className="flex flex-col items-center justify-center py-16 gap-3 text-center">
                            <BookOpen className="h-10 w-10 text-muted-foreground/40" />
                            <p className="text-sm font-medium text-muted-foreground">No evergreen content yet</p>
                            <p className="text-xs text-muted-foreground max-w-xs">
                                Evergreen posts recycle automatically. Create content in the Composer and mark it evergreen.
                            </p>
                            <Button asChild size="sm" variant="outline" className="mt-2">
                                <Link href="/app/social/composer">Create Content</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
