'use client'

import { useState } from "react"
import {
    Check,
    ExternalLink,
    RefreshCw,
    XCircle,
    Settings2,
    ShieldCheck,
    Loader2,
    Lock,
    Key,
    Globe
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface Integration {
    id: string
    name: string
    description: string
    icon: string
    iconColor: string
    connected: boolean
    category: string
    lastSync?: string
    type: 'oauth' | 'apikey'
}

const INITIAL_INTEGRATIONS: Integration[] = [
    {
        id: "quickbooks",
        name: "QuickBooks",
        description: "Sync invoices, payments, and customer data directly with your accounting software.",
        icon: "Q",
        iconColor: "bg-green-600",
        connected: false,
        category: "Accounting",
        type: 'oauth'
    },
    {
        id: "google-calendar",
        name: "Google Calendar",
        description: "Sync your coating schedule with personal or team calendars.",
        icon: "G",
        iconColor: "bg-red-500",
        connected: true,
        category: "Scheduling",
        lastSync: "1 hour ago",
        type: 'oauth'
    },
    {
        id: "twilio",
        name: "Twilio",
        description: "Send automated SMS updates to customers about their job status.",
        icon: "T",
        iconColor: "bg-red-600",
        connected: false,
        category: "Communications",
        type: 'apikey'
    }
]

export function IntegrationsTab() {
    const [integrations, setIntegrations] = useState(INITIAL_INTEGRATIONS)
    const [isSyncing, setIsSyncing] = useState<string | null>(null)
    const [syncStep, setSyncStep] = useState<string>("")
    const [connectingIntegration, setConnectingIntegration] = useState<Integration | null>(null)
    const [isConnecting, setIsConnecting] = useState(false)
    const [configuringIntegration, setConfiguringIntegration] = useState<Integration | null>(null)

    const handleToggle = (id: string, currentStatus: boolean) => {
        if (!currentStatus) {
            // Opening connection flow
            const integration = integrations.find(i => i.id === id)
            if (integration) setConnectingIntegration(integration)
        } else {
            // Disconnecting
            setIntegrations(prev => prev.map(item =>
                item.id === id ? { ...item, connected: false } : item
            ))
            toast.info(`Disconnected from ${id.charAt(0).toUpperCase() + id.slice(1)}`)
        }
    }

    const completeConnection = () => {
        if (!connectingIntegration) return

        setIsConnecting(true)
        const id = connectingIntegration.id

        // Mock connection delay
        setTimeout(() => {
            setIntegrations(prev => prev.map(item =>
                item.id === id ? { ...item, connected: true, lastSync: "Just now" } : item
            ))
            setIsConnecting(false)
            setConnectingIntegration(null)
            toast.success(`Successfully connected to ${connectingIntegration.name}!`)
        }, 2000)
    }

    const handleSync = (id: string) => {
        setIsSyncing(id)
        const steps = [
            "Initializing handshake...",
            "Authenticating credentials...",
            "Fetching delta updates...",
            "Resolving record conflicts...",
            "Finalizing sync..."
        ]

        let currentStep = 0
        setSyncStep(steps[0])

        const interval = setInterval(() => {
            currentStep++
            if (currentStep < steps.length) {
                setSyncStep(steps[currentStep])
            } else {
                clearInterval(interval)
                setIsSyncing(null)
                setSyncStep("")
                toast.success("Sync completed successfully")
            }
        }, 800)
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6">
                {integrations.map((item) => (
                    <Card key={item.id} className={`${!item.connected ? 'opacity-75 grayscale-[0.5]' : ''} transition-all duration-300 hover:shadow-md`}>
                        <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                            <div className={`h-12 w-12 ${item.iconColor} rounded-lg flex items-center justify-center font-bold text-white text-xl shrink-0 shadow-sm transition-transform group-hover:scale-110`}>
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <CardTitle className="text-lg">{item.name}</CardTitle>
                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{item.category}</Badge>
                                    {item.connected && (
                                        <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-200 gap-1 flex py-0 h-5">
                                            <ShieldCheck className="h-3 w-3" />
                                            Connected
                                        </Badge>
                                    )}
                                </div>
                                <CardDescription className="line-clamp-1">{item.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-4">
                                <Switch
                                    checked={item.connected}
                                    onCheckedChange={() => handleToggle(item.id, item.connected)}
                                />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm mt-2">
                                <div className="flex items-center gap-4">
                                    {item.connected ? (
                                        <>
                                            <div className="flex flex-col">
                                                <div className="flex items-center text-muted-foreground">
                                                    <RefreshCw className={`mr-1.5 h-3 w-3 ${isSyncing === item.id ? 'animate-spin text-primary' : ''}`} />
                                                    <span className="text-xs">
                                                        {isSyncing === item.id ? syncStep : `Last synced: ${item.lastSync}`}
                                                    </span>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-8 px-3 text-xs"
                                                onClick={() => handleSync(item.id)}
                                                disabled={isSyncing === item.id}
                                            >
                                                {isSyncing === item.id ? (
                                                    <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                                                ) : null}
                                                Sync Now
                                            </Button>
                                        </>
                                    ) : (
                                        <div className="flex items-center text-muted-foreground italic bg-muted/50 px-3 py-1 rounded-full text-xs">
                                            <XCircle className="mr-1.5 h-3 w-3" />
                                            <span>Not configured</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {item.connected && (
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 gap-1.5"
                                            onClick={() => setConfiguringIntegration(item)}
                                        >
                                            <Settings2 className="h-3.5 w-3.5" />
                                            Configure
                                        </Button>
                                    )}
                                    <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
                                        Docs
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Connection Dialog */}
            <Dialog open={!!connectingIntegration} onOpenChange={(open) => !open && !isConnecting && setConnectingIntegration(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Connect {connectingIntegration?.name}</DialogTitle>
                        <DialogDescription>
                            {connectingIntegration?.type === 'apikey'
                                ? `Enter your ${connectingIntegration?.name} API credentials to enable the integration.`
                                : `Authorize TradeOps to access your ${connectingIntegration?.name} account.`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        {connectingIntegration?.type === 'apikey' ? (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="api_key" className="flex items-center gap-2">
                                        <Key className="h-4 w-4 text-muted-foreground" />
                                        Private API Key
                                    </Label>
                                    <Input
                                        id="api_key"
                                        type="password"
                                        placeholder={`sk_live_...`}
                                        className="font-mono"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="webhook_secret" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                        Webhook Secret (Optional)
                                    </Label>
                                    <Input
                                        id="webhook_secret"
                                        type="password"
                                        placeholder={`whsec_...`}
                                        className="font-mono"
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8 space-y-4 border-2 border-dashed rounded-lg bg-muted/30">
                                <div className={`h-16 w-16 ${connectingIntegration?.iconColor} rounded-full flex items-center justify-center text-white text-3xl font-bold shadow-lg`}>
                                    {connectingIntegration?.icon}
                                </div>
                                <div className="text-center">
                                    <p className="font-medium">Secure Authorization</p>
                                    <p className="text-sm text-muted-foreground leading-relaxed px-8">
                                        You will be redirected to {connectingIntegration?.name} to safely authorize this connection.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConnectingIntegration(null)} disabled={isConnecting}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-primary text-primary-foreground min-w-[120px]"
                            onClick={completeConnection}
                            disabled={isConnecting}
                        >
                            {isConnecting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Connecting...
                                </>
                            ) : (
                                connectingIntegration?.type === 'oauth' ? 'Authorize Now' : 'Save Connection'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Configuration Dialog */}
            <Dialog open={!!configuringIntegration} onOpenChange={(open) => !open && setConfiguringIntegration(null)}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{configuringIntegration?.name} Settings</DialogTitle>
                        <DialogDescription>
                            Configure how TradeOps interacts with {configuringIntegration?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-6 py-4">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Automatic Sync</Label>
                                    <p className="text-[12px] text-muted-foreground">Keep data in sync automatically every hour.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label>Real-time Webhooks</Label>
                                    <p className="text-[12px] text-muted-foreground">Receive instant updates for event triggers.</p>
                                </div>
                                <Switch defaultChecked />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="env">Environment</Label>
                                <Badge variant="secondary" className="w-fit gap-1">
                                    <Globe className="h-3 w-3" />
                                    Production
                                </Badge>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setConfiguringIntegration(null)}>
                            Close
                        </Button>
                        <Button onClick={() => {
                            toast.success("Settings updated")
                            setConfiguringIntegration(null)
                        }}>
                            Save Settings
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Card className="bg-muted/30 border-dashed">
                <CardHeader>
                    <CardTitle className="text-base font-semibold">Request an Integration</CardTitle>
                    <CardDescription>Don't see a service you use? Let us know what we should add next.</CardDescription>
                </CardHeader>
                <CardFooter>
                    <Button variant="outline" className="w-full border-dashed hover:border-solid transition-all">Submit Request</Button>
                </CardFooter>
            </Card>
        </div>
    )
}
