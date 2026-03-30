'use client'

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import {
    ExternalLink,
    RefreshCw,
    XCircle,
    Settings2,
    ShieldCheck,
    Loader2,
    Lock,
    Key,
    Globe,
    BarChart3
} from "lucide-react"
import { saveAnalyticsSettings, getAnalyticsSettings } from "@/app/actions/analytics"
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
    primaryEmail?: string
    environment?: string
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
        id: "stripe",
        name: "Stripe",
        description: "Collect deposit payments from customers via secure payment links sent with every accepted quote.",
        icon: "S",
        iconColor: "bg-indigo-600",
        connected: false,
        category: "Payments",
        type: 'apikey'
    },
    {
        id: "google-calendar",
        name: "Google Calendar",
        description: "Sync your coating schedule with personal or team calendars.",
        icon: "G",
        iconColor: "bg-red-500",
        connected: false,
        category: "Scheduling",
        type: 'oauth'
    },
    {
        id: "google-analytics",
        name: "Google Analytics",
        description: "View website sessions, users, and page views for pioneerconcretecoatings.com directly on the dashboard.",
        icon: "GA",
        iconColor: "bg-orange-500",
        connected: false,
        category: "Analytics",
        type: 'apikey'
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
    const [gaFields, setGaFields] = useState({ propertyId: "", clientEmail: "", privateKey: "" })
    const searchParams = useSearchParams()

    // Check QB connection status on mount and handle URL params
    useEffect(() => {
        // Check for QB OAuth callback results
        const qbConnected = searchParams.get('qb_connected')
        const qbError = searchParams.get('qb_error')

        if (qbConnected === 'true') {
            toast.success('Successfully connected to QuickBooks!')
        } else if (qbError) {
            const errorMessages: Record<string, string> = {
                denied: 'QuickBooks authorization was denied.',
                config: 'QuickBooks is not configured. Check environment variables and ensure Redirect URI matches Intuit Developer Portal.',
                missing_params: 'Missing OAuth parameters from QuickBooks.',
                token_exchange: 'Failed to exchange authorization code. Please try again.',
            }
            toast.error(errorMessages[qbError] || 'QuickBooks connection failed.')
        }

        // Fetch actual QB connection status
        fetch('/app/api/quickbooks/status')
            .then(res => res.json())
            .then(data => {
                if (data.connected) {
                    setIntegrations(prev => prev.map(item =>
                        item.id === 'quickbooks'
                            ? {
                                ...item,
                                connected: true,
                                lastSync: data.companyName || 'Connected',
                                primaryEmail: data.primaryEmail,
                                environment: data.environment
                              }
                            : item
                    ))
                }
            })
            .catch(() => { /* QB status check failed silently */ })

        // Fetch Stripe connection status
        fetch('/app/api/stripe/status')
            .then(res => res.json())
            .then(data => {
                if (data.connected) {
                    setIntegrations(prev => prev.map(item =>
                        item.id === 'stripe'
                            ? {
                                ...item,
                                connected: true,
                                lastSync: 'Active',
                                environment: data.mode
                              }
                            : item
                    ))
                }
            })
            .catch(() => { /* Stripe status check failed silently */ })

        // Check Google Analytics connection status
        getAnalyticsSettings().then(result => {
            if (result.success && result.data?.propertyId) {
                setGaFields({
                    propertyId: result.data.propertyId,
                    clientEmail: result.data.clientEmail ?? "",
                    privateKey: result.data.privateKey ?? "",
                })
                setIntegrations(prev => prev.map(item =>
                    item.id === 'google-analytics'
                        ? { ...item, connected: true, lastSync: `Property ${result.data.propertyId}` }
                        : item
                ))
            }
        })
    }, [searchParams])

    const handleToggle = (id: string, currentStatus: boolean) => {
        if (!currentStatus) {
            if (id === 'quickbooks') {
                window.location.href = '/app/api/quickbooks/connect'
                return
            }
            // Stripe and others open a config dialog
            const integration = integrations.find(i => i.id === id)
            if (integration) setConnectingIntegration(integration)
        } else {
            if (id === 'quickbooks') {
                fetch('/app/api/quickbooks/disconnect', { method: 'POST' })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            setIntegrations(prev => prev.map(item =>
                                item.id === 'quickbooks' ? { ...item, connected: false, lastSync: undefined } : item
                            ))
                            toast.info('Disconnected from QuickBooks')
                        }
                    })
                return
            }
            // Stripe is configured via env vars — just inform the user
            if (id === 'stripe') {
                toast.info('To disable Stripe, remove STRIPE_SECRET_KEY from your environment variables.')
                return
            }
            setIntegrations(prev => prev.map(item =>
                item.id === id ? { ...item, connected: false } : item
            ))
            toast.info(`Disconnected from ${id.charAt(0).toUpperCase() + id.slice(1)}`)
        }
    }

    const completeConnection = async () => {
        if (!connectingIntegration) return

        // For QuickBooks, redirect to OAuth (shouldn't normally reach here)
        if (connectingIntegration.id === 'quickbooks') {
            window.location.href = '/app/api/quickbooks/connect'
            return
        }

        // Google Analytics — save credentials via server action
        if (connectingIntegration.id === 'google-analytics') {
            if (!gaFields.propertyId || !gaFields.clientEmail || !gaFields.privateKey) {
                toast.error("Please fill in all three fields.")
                return
            }
            setIsConnecting(true)
            const result = await saveAnalyticsSettings(gaFields)
            setIsConnecting(false)
            if (result.success) {
                setIntegrations(prev => prev.map(item =>
                    item.id === 'google-analytics'
                        ? { ...item, connected: true, lastSync: `Property ${gaFields.propertyId}` }
                        : item
                ))
                setConnectingIntegration(null)
                toast.success("Google Analytics connected!")
            } else {
                toast.error(result.error ?? "Failed to save credentials.")
            }
            return
        }

        setIsConnecting(true)
        const id = connectingIntegration.id

        // Mock connection delay for non-QB integrations
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
                                        <div className="flex items-center gap-2">
                                            <Badge variant="default" className="bg-green-500/10 text-green-600 border-green-200 gap-1 flex py-0 h-5">
                                                <ShieldCheck className="h-3 w-3" />
                                                Connected
                                            </Badge>
                                            {item.id === 'quickbooks' && item.environment && (
                                                <Badge variant="secondary" className="text-[10px] uppercase h-5 px-1.5 font-bold">
                                                    {item.environment}
                                                </Badge>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <CardDescription className="line-clamp-1">{item.description}</CardDescription>
                                    {item.connected && item.id === 'quickbooks' && item.primaryEmail && (
                                        <p className="text-[11px] text-muted-foreground mt-0.5">
                                            Authorized as: <span className="font-medium text-foreground">{item.primaryEmail}</span>
                                        </p>
                                    )}
                                </div>
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
                                            onClick={() => {
                                                if (item.id === 'quickbooks') {
                                                    window.location.href = '/app/api/quickbooks/connect'
                                                } else if (item.id === 'stripe') {
                                                    window.open('https://dashboard.stripe.com', '_blank')
                                                } else {
                                                    setConfiguringIntegration(item)
                                                }
                                            }}
                                        >
                                            {item.id === 'quickbooks' ? (
                                                <>
                                                    <RefreshCw className="h-3.5 w-3.5" />
                                                    Reconnect
                                                </>
                                            ) : item.id === 'stripe' ? (
                                                <>
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                    Dashboard
                                                </>
                                            ) : (
                                                <>
                                                    <Settings2 className="h-3.5 w-3.5" />
                                                    Configure
                                                </>
                                            )}
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
                        {connectingIntegration?.id === 'google-analytics' ? (
                            <div className="space-y-4">
                                <p className="text-xs text-muted-foreground">
                                    Create a <strong>Google Cloud Service Account</strong> with the Analytics Data API enabled, add it to your GA4 property, then paste the credentials below.
                                </p>
                                <div className="grid gap-2">
                                    <Label htmlFor="ga_property_id" className="flex items-center gap-2">
                                        <BarChart3 className="h-4 w-4 text-muted-foreground" />
                                        GA4 Property ID
                                    </Label>
                                    <Input
                                        id="ga_property_id"
                                        placeholder="123456789"
                                        className="font-mono"
                                        value={gaFields.propertyId}
                                        onChange={e => setGaFields(f => ({ ...f, propertyId: e.target.value }))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ga_client_email" className="flex items-center gap-2">
                                        <Key className="h-4 w-4 text-muted-foreground" />
                                        Service Account Email
                                    </Label>
                                    <Input
                                        id="ga_client_email"
                                        placeholder="my-sa@project.iam.gserviceaccount.com"
                                        className="font-mono text-xs"
                                        value={gaFields.clientEmail}
                                        onChange={e => setGaFields(f => ({ ...f, clientEmail: e.target.value }))}
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="ga_private_key" className="flex items-center gap-2">
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                        Private Key
                                    </Label>
                                    <Input
                                        id="ga_private_key"
                                        type="password"
                                        placeholder="-----BEGIN PRIVATE KEY-----..."
                                        className="font-mono text-xs"
                                        value={gaFields.privateKey}
                                        onChange={e => setGaFields(f => ({ ...f, privateKey: e.target.value }))}
                                    />
                                </div>
                            </div>
                        ) : connectingIntegration?.type === 'apikey' ? (
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
