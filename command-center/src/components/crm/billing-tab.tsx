'use client'

import { useState } from "react"
import { Check, CreditCard, Zap, Crown, Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

const PLANS = [
    {
        name: "Starter",
        price: "49",
        description: "Perfect for local independent contractors starting out.",
        features: ["Up to 50 Customers", "Basic Quotes", "1 Team Member", "Email Support"],
        icon: Zap,
        color: "text-blue-500",
        bg: "bg-blue-50"
    },
    {
        name: "Pro",
        price: "149",
        description: "For growing teams that need more control and visibility.",
        features: ["Unlimited Customers", "Advanced Scoping Tools", "Up to 5 Team Members", "Priority Support", "Calendar Integration"],
        icon: Crown,
        color: "text-purple-500",
        bg: "bg-purple-50",
        popular: true
    },
    {
        name: "Enterprise",
        price: "299",
        description: "The full powerhouse for established coating businesses.",
        features: ["Unlimited Team Members", "AI Lead Qualification", "Custom Branding", "Dedicated Account Manager", "Advanced Analytics"],
        icon: CreditCard,
        color: "text-amber-500",
        bg: "bg-amber-50"
    }
]

export function BillingTab() {
    const [currentPlan, setCurrentPlan] = useState("Enterprise")
    const [upgradingTo, setUpgradingTo] = useState<string | null>(null)
    const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null)

    const handleUpgrade = (planName: string) => {
        if (planName === "Enterprise") {
            toast.info("Contacting sales for Enterprise activation...", {
                description: "A representative will reach out shortly."
            })
            return
        }

        setUpgradingTo(planName)

        // Mock payment processing delay
        setTimeout(() => {
            setCurrentPlan(planName)
            setUpgradingTo(null)
            toast.success(`Successfully upgraded to ${planName}!`, {
                description: "Your new features are now available."
            })
        }, 1500)
    }

    const handleDownload = (date: string) => {
        setDownloadingInvoice(date)

        // Mock download delay
        setTimeout(() => {
            // Generate a simple mock blob to simulate file download
            const content = `Invoice for Pioneer Concrete Coatings\nDate: ${date}\nAmount: $299.00\nStatus: Paid\n\nThank you for your business!`
            const blob = new Blob([content], { type: 'text/plain' })
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `invoice-${date.toLowerCase().replace(/ /g, '-')}.txt`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setDownloadingInvoice(null)
            toast.success("Invoice downloaded successfully")
        }, 1000)
    }

    return (
        <div className="space-y-6">
            <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                    <div>
                        <CardTitle className="text-xl">Current Subscription</CardTitle>
                        <CardDescription>You are currently on the {currentPlan} plan.</CardDescription>
                    </div>
                    <Badge variant="default" className="bg-primary text-primary-foreground">Active</Badge>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            <span>Next billing date: **March 7, 2026**</span>
                        </div>
                        <div className="h-4 w-px bg-border" />
                        <div className="flex items-center gap-2">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <span>Amount: **${PLANS.find(p => p.name === currentPlan)?.price || '299'}.00/mo**</span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="pt-0">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownload("Feb 7, 2026")}
                        disabled={!!downloadingInvoice}
                    >
                        {downloadingInvoice === "Feb 7, 2026" ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Download className="mr-2 h-4 w-4" />
                        )}
                        Download Last Invoice
                    </Button>
                </CardFooter>
            </Card>

            <div className="grid gap-6 md:grid-cols-3 pt-2">
                {PLANS.map((plan) => (
                    <Card key={plan.name} className={`relative flex flex-col transition-all duration-300 ${plan.popular ? 'border-primary shadow-md scale-105 z-10' : 'hover:border-primary/50'}`}>
                        {plan.popular && (
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                <Badge className="bg-primary text-primary-foreground px-3">Most Popular</Badge>
                            </div>
                        )}
                        <CardHeader>
                            <div className={`${plan.bg} ${plan.color} w-10 h-10 rounded-lg flex items-center justify-center mb-2`}>
                                <plan.icon className="h-6 w-6" />
                            </div>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription className="min-h-[40px]">{plan.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="flex items-baseline gap-1">
                                <span className="text-3xl font-bold">${plan.price}</span>
                                <span className="text-muted-foreground">/mo</span>
                            </div>
                            <ul className="space-y-2 text-sm">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2">
                                        <Check className="h-4 w-4 text-green-500 shrink-0" />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </CardContent>
                        <CardFooter>
                            <Button
                                className="w-full"
                                variant={plan.name === currentPlan ? "secondary" : (plan.popular ? "default" : "outline")}
                                disabled={plan.name === currentPlan || !!upgradingTo}
                                onClick={() => handleUpgrade(plan.name)}
                            >
                                {upgradingTo === plan.name ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : null}
                                {plan.name === currentPlan ? "Current Plan" : (plan.name === "Enterprise" ? "Contact Sales" : `Upgrade to ${plan.name}`)}
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Billing History</CardTitle>
                    <CardDescription>View and download your past invoices.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[
                            { date: "Feb 7, 2026", amount: "$299.00", status: "Paid" },
                            { date: "Jan 7, 2026", amount: "$299.00", status: "Paid" },
                            { date: "Dec 7, 2025", amount: "$299.00", status: "Paid" },
                        ].map((invoice, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b last:border-0">
                                <div className="space-y-1">
                                    <p className="text-sm font-medium">{invoice.date}</p>
                                    <p className="text-xs text-muted-foreground">{invoice.status}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-medium">{invoice.amount}</span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDownload(invoice.date)}
                                        disabled={downloadingInvoice === invoice.date}
                                    >
                                        {downloadingInvoice === invoice.date ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : (
                                            "Download"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
