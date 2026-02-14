"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Facebook, Instagram, Linkedin, MapPin, Key, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { upsertSocialConnection, getSocialConnections } from "@/app/actions/social";
import { Platform } from "@prisma/client";

export default function SocialSettingsPage() {
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [businessId] = useState("clun12345"); // Mock business ID for now, usually from session
    const [connected, setConnected] = useState<Record<string, boolean>>({
        GOOGLE_BUSINESS: false,
        FACEBOOK: false,
        INSTAGRAM: false,
        LINKEDIN: false
    });

    // API Credentials State
    const [credentials, setCredentials] = useState({
        FACEBOOK: { accessToken: "" },
        GOOGLE_BUSINESS: { apiKey: "" },
        LINKEDIN: { apiSecret: "" }
    });

    // Fetch existing connections on load
    useEffect(() => {
        const fetchConnections = async () => {
            const result = await getSocialConnections(businessId);
            if (result.success && result.data) {
                const connectionStates: Record<string, boolean> = {
                    GOOGLE_BUSINESS: false,
                    FACEBOOK: false,
                    INSTAGRAM: false,
                    LINKEDIN: false
                };
                const credentialStates = { ...credentials };

                result.data.forEach((conn: any) => {
                    connectionStates[conn.platform] = conn.isEnabled;
                    if (conn.platform === "FACEBOOK") credentialStates.FACEBOOK.accessToken = conn.accessToken || "";
                    if (conn.platform === "GOOGLE_BUSINESS") credentialStates.GOOGLE_BUSINESS.apiKey = conn.apiKey || "";
                    if (conn.platform === "LINKEDIN") credentialStates.LINKEDIN.apiSecret = conn.apiSecret || "";
                });

                setConnected(connectionStates);
                setCredentials(credentialStates);
            }
            setLoading(false);
        };
        fetchConnections();
    }, [businessId]);

    const handleSave = async () => {
        setSaving(true);
        try {
            // Save Meta/Facebook Token
            await upsertSocialConnection({
                platform: "FACEBOOK" as Platform,
                accessToken: credentials.FACEBOOK.accessToken,
                businessId
            });

            // Save Google OAuth Client ID (mapping to apiKey for now)
            await upsertSocialConnection({
                platform: "GOOGLE_BUSINESS" as Platform,
                apiKey: credentials.GOOGLE_BUSINESS.apiKey,
                businessId
            });

            // Save LinkedIn Secret
            await upsertSocialConnection({
                platform: "LINKEDIN" as Platform,
                apiSecret: credentials.LINKEDIN.apiSecret,
                businessId
            });

            toast.success("API credentials saved successfully");
        } catch (error) {
            toast.error("Failed to save credentials");
        } finally {
            setSaving(false);
        }
    };

    const handleConnect = async (platform: string) => {
        const newState = !connected[platform];
        const result = await upsertSocialConnection({
            platform: platform as Platform,
            isEnabled: newState,
            businessId
        });

        if (result.success) {
            setConnected(prev => ({ ...prev, [platform]: newState }));
            toast.success(`${platform.replace('_', ' ')} ${newState ? 'connected' : 'disconnected'}`);
        } else {
            toast.error("Failed to update connection");
        }
    };

    if (loading) {
        return (
            <div className="flex h-[400px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto px-4 py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter text-gray-900 uppercase">Social <span className="text-blue-600">Settings</span></h1>
                    <p className="text-gray-500 font-medium italic">Manage your platform connections and brand defaults.</p>
                </div>
                <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700 font-bold px-6 py-6 h-auto text-lg rounded-xl shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all">
                    {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                    SAVE ALL CHANGES
                </Button>
            </div>

            <Tabs defaultValue="accounts" className="w-full">
                <TabsList className="bg-gray-100/50 p-1.5 rounded-2xl h-14 border border-gray-100 flex gap-1 w-fit">
                    <TabsTrigger value="accounts" className="rounded-xl px-8 font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all h-full uppercase tracking-widest">CONNECTED ACCOUNTS</TabsTrigger>
                    <TabsTrigger value="api" className="rounded-xl px-8 font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all h-full uppercase tracking-widest">API CREDENTIALS</TabsTrigger>
                    <TabsTrigger value="brand" className="rounded-xl px-8 font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-blue-600 transition-all h-full uppercase tracking-widest">BRAND KIT</TabsTrigger>
                </TabsList>

                <TabsContent value="accounts" className="space-y-6 mt-6 focus-visible:outline-none">
                    <div className="grid gap-6 md:grid-cols-2">
                        {[
                            { id: "GOOGLE_BUSINESS", icon: <MapPin className="h-5 w-5" />, name: "Google Business", detail: "TradeOps Springfield #129", color: "blue" },
                            { id: "FACEBOOK", icon: <Facebook className="h-5 w-5" />, name: "Facebook Page", detail: "Pioneer Concrete Coatings", color: "indigo" },
                            { id: "INSTAGRAM", icon: <Instagram className="h-5 w-5" />, name: "Instagram Business", detail: "@pioneerconcretecoatings", color: "pink" },
                            { id: "LINKEDIN", icon: <Linkedin className="h-5 w-5" />, name: "LinkedIn Page", detail: "Pioneer Concrete LLC", color: "blue" }
                        ].map((plat) => (
                            <Card key={plat.id} className="border-2 shadow-xl shadow-gray-200/40 hover:shadow-gray-200 transition-all overflow-hidden group">
                                <div className={`h-1.5 w-full bg-${plat.color}-500`} />
                                <CardHeader className="flex flex-row items-center justify-between py-4 bg-gray-50/50 border-b">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 bg-${plat.color}-50 rounded-lg text-${plat.color}-600`}>
                                            {plat.icon}
                                        </div>
                                        <CardTitle className="text-base font-bold">{plat.name}</CardTitle>
                                    </div>
                                    <Badge className={connected[plat.id] ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-500 border-gray-200"} variant="outline">
                                        {connected[plat.id] ? "READY" : "DISCONNECTED"}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-gray-800">{connected[plat.id] ? plat.detail : "Link Required"}</p>
                                            <p className="text-xs text-gray-500">{connected[plat.id] ? "Last verified 1 hour ago" : "Connect to enable automated posting"}</p>
                                        </div>
                                        <Button
                                            variant={connected[plat.id] ? "ghost" : "outline"}
                                            size="sm"
                                            className="font-bold rounded-lg px-4"
                                            onClick={() => handleConnect(plat.id)}
                                        >
                                            {connected[plat.id] ? "Change" : "Connect"}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="api" className="space-y-6 mt-6 focus-visible:outline-none">
                    <Card className="border-2 shadow-xl shadow-gray-200/40 max-w-2xl">
                        <CardHeader className="border-b bg-gray-50/50">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Key className="h-5 w-5 text-gray-600" /> API Management
                            </CardTitle>
                            <CardDescription className="text-gray-500 font-medium">Manual override for API keys and tokens.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Meta/Facebook Access Token</Label>
                                    <Input
                                        type="password"
                                        placeholder="EAAB..."
                                        className="h-12 rounded-xl focus:ring-blue-500 border-gray-200 px-4"
                                        value={credentials.FACEBOOK.accessToken}
                                        onChange={(e) => setCredentials(prev => ({
                                            ...prev,
                                            FACEBOOK: { ...prev.FACEBOOK, accessToken: e.target.value }
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Google OAuth Client ID</Label>
                                    <Input
                                        placeholder="12345-abc.apps.googleusercontent.com"
                                        className="h-12 rounded-xl focus:ring-blue-500 border-gray-200 px-4"
                                        value={credentials.GOOGLE_BUSINESS.apiKey}
                                        onChange={(e) => setCredentials(prev => ({
                                            ...prev,
                                            GOOGLE_BUSINESS: { ...prev.GOOGLE_BUSINESS, apiKey: e.target.value }
                                        }))}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">LinkedIn API Secret</Label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••••••"
                                        className="h-12 rounded-xl focus:ring-blue-500 border-gray-200 px-4"
                                        value={credentials.LINKEDIN.apiSecret}
                                        onChange={(e) => setCredentials(prev => ({
                                            ...prev,
                                            LINKEDIN: { ...prev.LINKEDIN, apiSecret: e.target.value }
                                        }))}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="brand" className="space-y-4 mt-6 focus-visible:outline-none">
                    <Card className="border-2 shadow-xl shadow-gray-200/40">
                        <CardHeader className="border-b bg-gray-50/50">
                            <CardTitle className="text-lg font-black tracking-tight">AI BRAND VOICE</CardTitle>
                            <CardDescription className="text-gray-500 font-medium">Teach the AI how to represent Pioneer Concrete Coatings.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Target Tone</Label>
                                <Input defaultValue="Professional, Reliable, High-Quality, Local" className="h-12 rounded-xl border-gray-200 px-4 font-bold" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Core Value Proposition</Label>
                                <Textarea
                                    defaultValue="1-Day Installation, 15-Year Warranty, Industrial Grade Materials, Family Owned & Operated"
                                    className="min-h-[120px] rounded-xl border-gray-200 p-4 text-base leading-relaxed font-semibold focus:ring-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-gray-400">Excluded Keywords</Label>
                                <Input defaultValue="Cheap, Painting, Kits, DIY" className="h-12 rounded-xl border-gray-200 px-4 text-red-600 font-bold" />
                                <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest px-1 py-1">AI will strictly avoid these words in generated content</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}



