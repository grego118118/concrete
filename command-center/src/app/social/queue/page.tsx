import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Repeat, Trash2, Edit } from "lucide-react";

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
                    <Button>Add to Queue</Button>
                </div>
            </div>

            <Tabs defaultValue="scheduled">
                <TabsList>
                    <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
                    <TabsTrigger value="evergreen">Evergreen Library</TabsTrigger>
                </TabsList>

                <TabsContent value="scheduled" className="mt-4 space-y-4">
                    {/* Scheduled Items List */}
                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded flex items-center justify-center font-bold text-xs">
                                    FACEBOOK
                                </div>
                                <div>
                                    <h4 className="font-semibold line-clamp-1">Did you know regular cleaning extends concrete life?</h4>
                                    <p className="text-sm text-muted-foreground">Tomorrow at 10:00 AM</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 bg-pink-100 text-pink-600 rounded flex items-center justify-center font-bold text-xs">
                                    INSTAGRAM
                                </div>
                                <div>
                                    <h4 className="font-semibold line-clamp-1">Before & After: Hartford Basement Transformation</h4>
                                    <p className="text-sm text-muted-foreground">Wed, Oct 28 at 9:00 AM</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Button size="icon" variant="ghost"><Edit className="h-4 w-4" /></Button>
                                <Button size="icon" variant="ghost" className="text-destructive"><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="evergreen" className="mt-4 space-y-4">
                    <Card className="border-l-4 border-green-500">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between">
                                <Badge variant="outline" className="text-green-600 bg-green-50 flex gap-1">
                                    <Repeat className="h-3 w-3" />
                                    Recycling Active
                                </Badge>
                                <Button size="sm" variant="ghost">Edit</Button>
                            </div>
                            <CardTitle className="text-lg">Educational: Concrete Maintenance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                Posts about how to clean and maintain decorative concrete coatings. Includes 5 variations.
                            </p>
                            <div className="mt-4 text-xs font-mono text-muted-foreground">
                                Last used: 2 weeks ago
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
