import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Image as ImageIcon, TrendingUp, MessageCircle } from "lucide-react";

export default function SocialDashboardPage() {
    return (
        <div className="space-y-8">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Scheduled Posts</CardTitle>
                        <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground">Next: Tomorrow 9:00 AM</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Reach</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">4.2k</div>
                        <p className="text-xs text-muted-foreground text-green-600">+12% last 30 days</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New Reviews</CardTitle>
                        <MessageCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">3</div>
                        <p className="text-xs text-muted-foreground">Pending response</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <div className="col-span-4 space-y-4">
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Content Calendar</CardTitle>
                            <CardDescription>Upcoming scheduled content.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Mock Calendar Feed */}
                                <div className="flex items-center gap-4 border-b pb-4 last:border-0">
                                    <div className="h-12 w-12 rounded bg-muted flex flex-col items-center justify-center border text-xs font-bold text-muted-foreground">
                                        <span>OCT</span>
                                        <span className="text-lg text-foreground">25</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Project Showcase: Wilbraham Garage</h4>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline">Google</Badge>
                                            <Badge variant="outline">Facebook</Badge>
                                        </div>
                                    </div>
                                    <div className="ml-auto text-sm text-muted-foreground">09:00 AM</div>
                                </div>
                                <div className="flex items-center gap-4 border-b pb-4 last:border-0">
                                    <div className="h-12 w-12 rounded bg-muted flex flex-col items-center justify-center border text-xs font-bold text-muted-foreground">
                                        <span>OCT</span>
                                        <span className="text-lg text-foreground">27</span>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Tip: Cleaning Epoxy Floors</h4>
                                        <div className="flex gap-2 mt-1">
                                            <Badge variant="outline">Instagram</Badge>
                                        </div>
                                    </div>
                                    <div className="ml-auto text-sm text-muted-foreground">10:30 AM</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="col-span-3 space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>GBP Performance</CardTitle>
                            <CardDescription>Google Business Profile interactions.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Profile Views</span>
                                    <span className="font-bold">1,204</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[70%]" />
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between text-sm">
                                    <span>Direction Requests</span>
                                    <span className="font-bold">45</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[45%]" />
                                </div>
                            </div>
                            <div className="space-y-2 mt-4">
                                <div className="flex justify-between text-sm">
                                    <span>Call Button Clicks</span>
                                    <span className="font-bold">28</span>
                                </div>
                                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500 w-[30%]" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
