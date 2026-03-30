import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Eye, MousePointerClick, ExternalLink } from "lucide-react";
import { getWebsiteTraffic } from "@/app/actions/analytics";
import Link from "next/link";

export async function WebTrafficCard() {
    const result = await getWebsiteTraffic();

    if (!result.connected) {
        return (
            <Card className="border-orange-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-orange-500" />
                        Website Traffic
                    </CardTitle>
                    <CardDescription>pioneerconcretecoatings.com</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-6 gap-3 text-center">
                    <p className="text-sm text-muted-foreground">
                        Connect Google Analytics to see web traffic on your dashboard.
                    </p>
                    <Button asChild size="sm" variant="outline" className="gap-1.5">
                        <Link href="/app/crm/settings?tab=integrations">
                            <ExternalLink className="h-3.5 w-3.5" />
                            Connect in Integrations
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (!result.data) {
        return (
            <Card className="border-orange-100 shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-orange-500" />
                        Website Traffic
                    </CardTitle>
                    <CardDescription>pioneerconcretecoatings.com — Last 30 days</CardDescription>
                </CardHeader>
                <CardContent className="py-4">
                    <p className="text-sm text-muted-foreground text-center">
                        Connected, but no data returned. Check your GA4 property permissions.
                    </p>
                </CardContent>
            </Card>
        );
    }

    const { sessions, users, pageViews, bounceRate } = result.data;

    return (
        <Card className="border-orange-100 shadow-sm">
            <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-orange-500" />
                        Website Traffic
                    </CardTitle>
                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-green-50 border border-green-200">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        <span className="text-[10px] font-bold text-green-700 uppercase tracking-tighter">Live</span>
                    </div>
                </div>
                <CardDescription>pioneerconcretecoatings.com — Last 30 days</CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-3">
                <div className="flex items-center gap-6 w-full justify-center py-2">
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-black tracking-tighter text-orange-600">
                            {sessions.toLocaleString()}
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
                            Sessions
                        </p>
                    </div>
                    <div className="h-8 w-px bg-gray-200" />
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-black tracking-tighter text-blue-600">
                            {users.toLocaleString()}
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
                            Users
                        </p>
                    </div>
                    <div className="h-8 w-px bg-gray-200" />
                    <div className="flex flex-col items-center">
                        <div className="text-3xl font-black tracking-tighter text-purple-600">
                            {pageViews.toLocaleString()}
                        </div>
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground mt-0.5">
                            Page Views
                        </p>
                    </div>
                </div>
                <div className="mt-2 flex justify-center">
                    <p className="text-[10px] text-muted-foreground">
                        Bounce rate: <span className="font-semibold">{(bounceRate * 100).toFixed(1)}%</span>
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
