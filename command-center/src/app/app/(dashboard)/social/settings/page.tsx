"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Linkedin, MapPin, Key, Save, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { upsertSocialConnection, getSocialConnections } from "@/app/actions/social";
import { Platform } from "@prisma/client";

const PLATFORMS = [
    {
        id: "FACEBOOK" as Platform,
        icon: <Facebook className="h-5 w-5" />,
        name: "Facebook Page",
        description: "Post updates, photos, and promotions to your Facebook business page.",
        color: "indigo",
    },
    {
        id: "INSTAGRAM" as Platform,
        icon: <Instagram className="h-5 w-5" />,
        name: "Instagram Business",
        description: "Share before/after photos and reels to grow your audience.",
        color: "pink",
    },
    {
        id: "GOOGLE_BUSINESS" as Platform,
        icon: <MapPin className="h-5 w-5" />,
        name: "Google Business Profile",
        description: "Post updates directly to your Google listing to boost local SEO.",
        color: "blue",
    },
    {
        id: "LINKEDIN" as Platform,
        icon: <Linkedin className="h-5 w-5" />,
        name: "LinkedIn Page",
        description: "Share project highlights and company news with professionals.",
        color: "blue",
    },
];

export default function SocialSettingsPage() {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [connected, setConnected] = useState<Record<string, boolean>>({
        GOOGLE_BUSINESS: false,
        FACEBOOK: false,
        INSTAGRAM: false,
        LINKEDIN: false,
    });

    const [credentials, setCredentials] = useState({
        FACEBOOK: { accessToken: "" },
        INSTAGRAM: { accessToken: "" },
        GOOGLE_BUSINESS: { apiKey: "" },
        LINKEDIN: { apiSecret: "" },
    });

    useEffect(() => {
        getSocialConnections().then((result) => {
            if (result.success && result.data) {
                const states: Record<string, boolean> = {
                    GOOGLE_BUSINESS: false, FACEBOOK: false,
                    INSTAGRAM: false, LINKEDIN: false,
                };
                const creds = { ...credentials };
                result.data.forEach((conn: any) => {
                    states[conn.platform] = conn.isEnabled;
                    if (conn.platform === "FACEBOOK") creds.FACEBOOK.accessToken = conn.accessToken || "";
                    if (conn.platform === "INSTAGRAM") creds.INSTAGRAM.accessToken = conn.accessToken || "";
                    if (conn.platform === "GOOGLE_BUSINESS") creds.GOOGLE_BUSINESS.apiKey = conn.apiKey || "";
                    if (conn.platform === "LINKEDIN") creds.LINKEDIN.apiSecret = conn.apiSecret || "";
                });
                setConnected(states);
                setCredentials(creds);
            }
            setLoading(false);
        });
    }, []);

    const handleToggle = async (platform: Platform) => {
        const newState = !connected[platform];
        const result = await upsertSocialConnection({ platform, isEnabled: newState });
        if (result.success) {
            setConnected(prev => ({ ...prev, [platform]: newState }));
            toast.success(`${platform.replace("_", " ")} ${newState ? "enabled" : "disabled"}`);
        } else {
            toast.error(result.error || "Failed to update");
        }
    };

    const handleSaveCredentials = async () => {
        setSaving(true);
        try {
            await Promise.all([
                upsertSocialConnection({ platform: "FACEBOOK", accessToken: credentials.FACEBOOK.accessToken }),
                upsertSocialConnection({ platform: "INSTAGRAM", accessToken: credentials.INSTAGRAM.accessToken }),
                upsertSocialConnection({ platform: "GOOGLE_BUSINESS", apiKey: credentials.GOOGLE_BUSINESS.apiKey }),
                upsertSocialConnection({ platform: "LINKEDIN", apiSecret: credentials.LINKEDIN.apiSecret }),
            ]);
            toast.success("Credentials saved");
        } catch {
            toast.error("Failed to save credentials");
        }
        setSaving(false);
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto px-4 py-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Social Settings</h1>
                <p className="text-muted-foreground mt-1">Connect your social accounts and enter your API credentials.</p>
            </div>

            <Tabs defaultValue="accounts" className="w-full">
                <TabsList>
                    <TabsTrigger value="accounts">Connected Accounts</TabsTrigger>
                    <TabsTrigger value="api">API Credentials</TabsTrigger>
                    <TabsTrigger value="brand">Brand Kit</TabsTrigger>
                </TabsList>

                {/* Connected Accounts */}
                <TabsContent value="accounts" className="space-y-4 mt-6">
                    <p className="text-sm text-muted-foreground">
                        Toggle platforms on/off. Enter your API credentials in the <strong>API Credentials</strong> tab first.
                    </p>
                    <div className="grid gap-4 md:grid-cols-2">
                        {PLATFORMS.map((plat) => (
                            <Card key={plat.id} className="flex flex-col">
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="text-slate-600">{plat.icon}</div>
                                            <CardTitle className="text-base">{plat.name}</CardTitle>
                                        </div>
                                        {connected[plat.id] ? (
                                            <Badge className="bg-green-100 text-green-700 border-green-200 gap-1" variant="outline">
                                                <CheckCircle2 className="h-3 w-3" /> Active
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-slate-100 text-slate-500 gap-1" variant="outline">
                                                <XCircle className="h-3 w-3" /> Off
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription className="text-xs mt-1">{plat.description}</CardDescription>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <Button
                                        variant={connected[plat.id] ? "outline" : "default"}
                                        size="sm"
                                        className="w-full"
                                        onClick={() => handleToggle(plat.id)}
                                    >
                                        {connected[plat.id] ? "Disable" : "Enable"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                {/* API Credentials */}
                <TabsContent value="api" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Key className="h-5 w-5" /> API Credentials
                            </CardTitle>
                            <CardDescription>
                                Enter your access tokens and API keys. These are stored securely and used to post on your behalf.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Facebook */}
                            <div className="space-y-2 pb-6 border-b">
                                <div className="flex items-center gap-2 mb-1">
                                    <Facebook className="h-4 w-4 text-indigo-600" />
                                    <Label className="font-semibold">Facebook — Long-Lived Access Token</Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Get this from <strong>Meta Business Suite → Settings → System Users → Generate Token</strong>. Needs <code>pages_manage_posts</code> permission.
                                </p>
                                <Input
                                    type="password"
                                    placeholder="EAAB..."
                                    value={credentials.FACEBOOK.accessToken}
                                    onChange={(e) => setCredentials(p => ({ ...p, FACEBOOK: { accessToken: e.target.value } }))}
                                />
                            </div>

                            {/* Instagram */}
                            <div className="space-y-2 pb-6 border-b">
                                <div className="flex items-center gap-2 mb-1">
                                    <Instagram className="h-4 w-4 text-pink-600" />
                                    <Label className="font-semibold">Instagram — Access Token</Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Instagram uses the same Meta token as Facebook if your Instagram account is linked to the same Meta Business account.
                                </p>
                                <Input
                                    type="password"
                                    placeholder="EAAB..."
                                    value={credentials.INSTAGRAM.accessToken}
                                    onChange={(e) => setCredentials(p => ({ ...p, INSTAGRAM: { accessToken: e.target.value } }))}
                                />
                            </div>

                            {/* Google Business */}
                            <div className="space-y-2 pb-6 border-b">
                                <div className="flex items-center gap-2 mb-1">
                                    <MapPin className="h-4 w-4 text-blue-600" />
                                    <Label className="font-semibold">Google Business Profile — API Key</Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Go to <strong>Google Cloud Console → APIs & Services → Credentials → Create API Key</strong>. Enable the "My Business API".
                                </p>
                                <Input
                                    placeholder="AIzaSy..."
                                    value={credentials.GOOGLE_BUSINESS.apiKey}
                                    onChange={(e) => setCredentials(p => ({ ...p, GOOGLE_BUSINESS: { apiKey: e.target.value } }))}
                                />
                            </div>

                            {/* LinkedIn */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 mb-1">
                                    <Linkedin className="h-4 w-4 text-blue-700" />
                                    <Label className="font-semibold">LinkedIn — Client Secret</Label>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Create an app at <strong>LinkedIn Developer Portal → My Apps</strong> and copy the Client Secret from the Auth tab.
                                </p>
                                <Input
                                    type="password"
                                    placeholder="••••••••••••"
                                    value={credentials.LINKEDIN.apiSecret}
                                    onChange={(e) => setCredentials(p => ({ ...p, LINKEDIN: { apiSecret: e.target.value } }))}
                                />
                            </div>

                            <div className="flex justify-end pt-2">
                                <Button onClick={handleSaveCredentials} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
                                    {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                    Save Credentials
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Brand Kit */}
                <TabsContent value="brand" className="mt-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>AI Brand Voice</CardTitle>
                            <CardDescription>
                                Teach the AI how to write posts that sound like Pioneer Concrete Coatings.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label>Target Tone</Label>
                                <Input defaultValue="Professional, Reliable, High-Quality, Local" />
                                <p className="text-xs text-muted-foreground">How you want to sound to customers.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Core Value Proposition</Label>
                                <Textarea
                                    defaultValue="1-Day Installation, 15-Year Warranty, Industrial Grade Materials, Family Owned & Operated"
                                    className="min-h-[100px]"
                                />
                                <p className="text-xs text-muted-foreground">Key selling points the AI will emphasize in every post.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Excluded Keywords</Label>
                                <Input defaultValue="Cheap, Painting, Kits, DIY" className="text-red-600" />
                                <p className="text-xs text-muted-foreground">Words the AI will never use.</p>
                            </div>
                            <div className="flex justify-end">
                                <Button className="bg-blue-600 hover:bg-blue-700">
                                    <Save className="h-4 w-4 mr-2" /> Save Brand Kit
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
