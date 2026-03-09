import { db } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LeadQualifierChat } from "@/components/crm/ai-lead-qualifier";
import { LeadList } from "@/components/crm/lead-list";
import { Users } from "lucide-react";

async function getLeads() {
    const business = await db.business.findFirst();
    if (!business) return [];

    return db.customer.findMany({
        where: { businessId: business.id },
        orderBy: { createdAt: "desc" },
        take: 100,
    });
}

export default async function LeadsPage() {
    const leads = await getLeads();

    const scraperLeads = leads.filter(l => l.leadSource === "SCRAPER");
    const websiteLeads = leads.filter(l => l.leadSource === "WEBSITE");
    const manualLeads = leads.filter(l => l.leadSource === "MANUAL");

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Lead Inbox</h1>
                    <p className="text-muted-foreground">
                        {leads.length} total leads — {scraperLeads.length} scraped, {websiteLeads.length} website, {manualLeads.length} manual
                    </p>
                </div>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-sm px-3 py-1">
                        <Users className="h-3.5 w-3.5 mr-1.5" />
                        {leads.length} Total
                    </Badge>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Lead List */}
                <Card className="flex flex-col md:col-span-2">
                    <CardHeader className="border-b shrink-0 pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle>All Leads</CardTitle>
                            <div className="flex gap-1.5">
                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 text-xs">
                                    Scraped: {scraperLeads.length}
                                </Badge>
                                <Badge variant="secondary" className="bg-green-50 text-green-700 text-xs">
                                    Website: {websiteLeads.length}
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {leads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                                <Users className="h-12 w-12 mb-4 opacity-20" />
                                <p className="font-semibold">No leads yet</p>
                                <p className="text-sm">Run the Lead Scraper from the dashboard to find new opportunities.</p>
                            </div>
                        ) : (
                            <LeadList leads={JSON.parse(JSON.stringify(leads))} />
                        )}
                    </CardContent>
                </Card>

                {/* Chat / Detail View */}
                <div className="h-full">
                    <LeadQualifierChat />
                </div>
            </div>
        </div>
    );
}
