"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, MousePointerClick, Users, BarChart3, TrendingUp, Globe, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function SocialAnalyticsPage() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">SOCIAL <span className="text-blue-600">ANALYTICS</span></h1>
                    <p className="text-gray-500 font-medium">Real-time performance metrics across all platforms.</p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {[
                    { title: "Total Reach", icon: <Eye className="h-5 w-5" />, color: "blue" },
                    { title: "Engagement", icon: <MousePointerClick className="h-5 w-5" />, color: "indigo" },
                    { title: "New Lead Gen", icon: <Users className="h-5 w-5" />, color: "green" }
                ].map((stat, i) => (
                    <Card key={i} className="border-2 shadow-xl shadow-gray-200/40 relative overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400">{stat.title}</CardTitle>
                            <div className={`p-2 bg-gray-50 rounded-xl text-gray-400`}>
                                {stat.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-gray-300">—</div>
                            <p className="text-xs text-muted-foreground mt-2">No data — connect platforms in Settings</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="bg-gray-100/50 p-1 rounded-xl h-14 border border-gray-100 flex gap-1 w-fit">
                    <TabsTrigger value="overview" className="rounded-lg px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all h-full uppercase tracking-tighter">Growth Overview</TabsTrigger>
                    <TabsTrigger value="platforms" className="rounded-lg px-8 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600 transition-all h-full uppercase tracking-tighter">By Platform</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="mt-6">
                    <Card className="border-2 shadow-xl shadow-gray-200/40 overflow-hidden">
                        <CardHeader className="bg-gray-50/50 border-b">
                            <CardTitle className="text-lg font-black flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-gray-600" /> MONTHLY PERFORMANCE
                            </CardTitle>
                            <CardDescription className="text-gray-500 font-medium">Aggregate metrics across all active campaigns.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[300px] flex flex-col items-center justify-center gap-4">
                            <WifiOff className="h-12 w-12 text-muted-foreground/30" />
                            <p className="text-sm text-muted-foreground text-center max-w-sm">
                                No analytics data yet. Connect your social platforms in{" "}
                                <Link href="/app/social/settings" className="underline underline-offset-2 hover:text-blue-600">
                                    Settings
                                </Link>{" "}
                                to start tracking performance.
                            </p>
                            <Button asChild variant="outline" size="sm">
                                <Link href="/app/social/settings">Go to Settings</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="platforms" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {["Google Business", "Facebook", "Instagram", "LinkedIn"].map((name, i) => (
                            <Card key={i} className="border-2 shadow-xl shadow-gray-200/40 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <Globe className="h-5 w-5 text-gray-300" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 text-sm uppercase">{name}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 tracking-wider">NOT CONNECTED</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase">
                                        <span>Health Score</span>
                                        <span>—</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full" />
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
