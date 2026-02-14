import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { getBusinessSettings } from "@/app/actions/settings";
import { getTeamMembers } from "@/app/actions/team";
import { SettingsForm } from "@/components/crm/settings-form";
import { TeamMembersTab } from "@/components/crm/team-members-tab";
import { BillingTab } from "@/components/crm/billing-tab";
import { IntegrationsTab } from "@/components/crm/integrations-tab";

export default async function CrmSettingsPage() {
    const business = await getBusinessSettings();
    const teamMembers = await getTeamMembers();

    // Ensure brandKit is treated as object
    const brandKit = typeof business.brandKit === 'object' ? business.brandKit : {};

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your business profile and preferences.</p>
            </div>

            <Tabs defaultValue="general" className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="team">Team Members</TabsTrigger>
                    <TabsTrigger value="billing">Billing & Plans</TabsTrigger>
                    <TabsTrigger value="integrations">Integrations</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                    <SettingsForm initialData={{ name: business.name, brandKit }} />
                </TabsContent>

                <TabsContent value="team" className="space-y-4">
                    <TeamMembersTab members={teamMembers} />
                </TabsContent>

                <TabsContent value="billing" className="space-y-4">
                    <BillingTab />
                </TabsContent>

                <TabsContent value="integrations" className="space-y-4">
                    <IntegrationsTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
