"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpRight, ArrowDownRight, Users, Eye, MousePointerClick, Calendar, BarChart3, TrendingUp, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";


export default function SocialAnalyticsPage() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">SOCIAL <span className="text-blue-600">ANALYTICS</span></h1>
                    <p className="text-gray-500 font-medium">Real-time performance metrics across all platforms.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-xl border-gray-200 font-bold text-gray-600">
                        <Calendar className="mr-2 h-4 w-4" /> LAST 30 DAYS
                    </Button>
                    <Button className="rounded-xl bg-gray-900 border-gray-200 font-bold">
                        <BarChart3 className="mr-2 h-4 w-4" /> EXPORT REPORT
                    </Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                {[
                    { title: "Total Reach", value: "24,892", change: "+18.2%", icon: <Eye className="h-5 w-5" />, color: "blue", positive: true },
                    { title: "Engagement", value: "5.2%", change: "+0.8%", icon: <MousePointerClick className="h-5 w-5" />, color: "indigo", positive: true },
                    { title: "New Lead Gen", value: "+42", change: "-4.1%", icon: <Users className="h-5 w-5" />, color: "green", positive: false }
                ].map((stat, i) => (
                    <Card key={i} className="border-2 shadow-xl shadow-gray-200/40 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-500/5 -mr-8 -mt-8 rounded-full blur-2xl group-hover:bg-${stat.color}-500/10 transition-colors`} />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-black uppercase tracking-widest text-gray-400">{stat.title}</CardTitle>
                            <div className={`p-2 bg-${stat.color}-50 rounded-xl text-${stat.color}-600`}>
                                {stat.icon}
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-gray-900">{stat.value}</div>
                            <div className={`text-xs font-bold mt-2 flex items-center ${stat.positive ? "text-green-600" : "text-red-500"}`}>
                                {stat.positive ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
                                {stat.change} <span className="text-gray-400 ml-1.5 font-medium italic">vs prev. period</span>
                            </div>
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
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black flex items-center gap-2">
                                        <TrendingUp className="h-5 w-5 text-gray-600" /> MONTHLY PERFORMANCE
                                    </CardTitle>
                                    <CardDescription className="text-gray-500 font-medium font-medium">Aggregate metrics across all active campaigns.</CardDescription>
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Reach</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-3 h-3 rounded-full bg-indigo-500" />
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Leads</span>
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[400px] p-6 bg-white flex flex-col items-center justify-center relative">
                            {/* Mock Chart Visualization */}
                            <div className="w-full h-full flex items-end justify-between gap-1 group relative">
                                {[35, 45, 30, 65, 55, 85, 40, 95, 75, 80, 60, 90].map((h, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center justify-end group">
                                        <div className="w-full bg-blue-500/10 rounded-t-lg relative group-hover:bg-blue-500/20 transition-all" style={{ height: `${h}%` }}>
                                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full -mt-0.5 shadow-[0_0_10px_rgba(37,99,235,0.5)]" />
                                        </div>
                                    </div>
                                ))}
                                <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gray-100" />
                                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-50">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="w-full border-t border-dashed border-gray-100" />)}
                                </div>
                            </div>
                            <div className="mt-8 flex justify-between w-full text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <span>Jan 01</span>
                                <span>Jan 15</span>
                                <span>Feb 01</span>
                                <span>Feb 09</span>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="platforms" className="mt-6">
                    <div className="grid gap-6 md:grid-cols-2">
                        {[
                            { name: "Google Business", reach: "12.4k", perf: 92, status: "EXCELLENT" },
                            { name: "Facebook Ads", reach: "8.2k", perf: 78, status: "STABLE" },
                            { name: "Instagram Shop", reach: "3.1k", perf: 85, status: "EXCELLENT" },
                            { name: "LinkedIn Career", reach: "1.2k", perf: 45, status: "ACTION REQ" }
                        ].map((plat, i) => (
                            <Card key={i} className="border-2 shadow-xl shadow-gray-200/40 p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <Globe className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div>
                                            <h3 className="font-black text-gray-900 text-sm uppercase">{plat.name}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 tracking-wider">MONTHLY REACH: {plat.reach}</p>
                                        </div>
                                    </div>
                                    <Badge variant="outline" className={`font-black text-[10px] ${plat.perf > 80 ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                                        {plat.status}
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-[10px] font-black text-gray-500 uppercase">
                                        <span>Health Score</span>
                                        <span>{plat.perf}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${plat.perf > 80 ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.3)]" : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]"}`}
                                            style={{ width: `${plat.perf}%` }}
                                        />
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}

