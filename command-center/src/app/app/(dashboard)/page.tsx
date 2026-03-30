import { getDashboardStats } from "@/app/actions/dashboard";
import { getTickets } from "@/app/actions/tickets";
import { SyncStatus } from "@/components/dashboard/sync-status";
import { TroubleTicketCard } from "@/components/dashboard/trouble-ticket-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DollarSign,
  Users,
  Plus,
  FileText,
  Briefcase,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  CircleDollarSign,
} from "lucide-react";
import Link from "next/link";
import { LeadScraperCard } from "@/components/dashboard/lead-scraper-card";
import { WebTrafficCard } from "@/components/dashboard/web-traffic-card";


function DeltaBadge({ delta }: { delta: number | null }) {
  if (delta === null) return <p className="text-xs text-muted-foreground">No data last month</p>;
  if (delta === 0) return <p className="text-xs text-muted-foreground flex items-center gap-1"><Minus className="h-3 w-3" /> No change vs last month</p>;
  const up = delta > 0;
  return (
    <p className={`text-xs flex items-center gap-1 ${up ? "text-emerald-600" : "text-red-500"}`}>
      {up ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {up ? "+" : ""}{delta}% vs last month
    </p>
  );
}

function timeAgo(date: Date) {
  const diff = Date.now() - new Date(date).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const ACTIVITY_ICON_CLASS: Record<string, string> = {
  customer: "bg-primary text-primary-foreground",
  job: "bg-secondary text-secondary-foreground",
  quote: "bg-blue-600 text-white",
  payment: "bg-emerald-600 text-white",
};

const ACTIVITY_ICON: Record<string, React.ReactNode> = {
  customer: <Users className="h-4 w-4" />,
  job: <Briefcase className="h-4 w-4" />,
  quote: <FileText className="h-4 w-4" />,
  payment: <CircleDollarSign className="h-4 w-4" />,
};

const ACTIVITY_HREF: Record<string, (id: string) => string> = {
  customer: (id) => `/app/crm/customers/${id}`,
  job: (id) => `/app/crm/jobs/${id}`,
  quote: (id) => `/app/crm/quotes/${id}`,
  payment: (_id) => `/app/crm/invoices`,
};

export default async function Home() {
  const [stats, tickets] = await Promise.all([getDashboardStats(), getTickets()]);

  return (
    <div className="flex-1 space-y-4 p-4 pt-4 md:p-8 md:pt-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex flex-wrap items-center gap-2">
          <SyncStatus />
          <Link href="/app/crm/quotes/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Quote
            </Button>
          </Link>
          <Link href="/app/crm/jobs/create">
            <Button variant="secondary">
              <Plus className="mr-2 h-4 w-4" /> New Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">
              ${parseFloat(stats.revenue).toLocaleString()}
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                <span>Invoiced Total</span>
                <span>${parseFloat(stats.invoicedTotal).toLocaleString()}</span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{ width: `${Math.min(100, (parseFloat(stats.revenue) / (parseFloat(stats.invoicedTotal) || 1)) * 100)}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                {Math.round((parseFloat(stats.revenue) / (parseFloat(stats.invoicedTotal) || 1)) * 100)}% of invoiced collected
              </p>
            </div>
          </CardContent>
        </Card>

        <Link href="/app/crm/jobs" className="block transition-opacity hover:opacity-80">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jobsCount}</div>
              <DeltaBadge delta={stats.jobsDelta} />
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/crm/quotes" className="block transition-opacity hover:opacity-80">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Quotes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quotesCount}</div>
              <DeltaBadge delta={stats.quotesDelta} />
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/crm/customers" className="block transition-opacity hover:opacity-80">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leadsCount}</div>
              <DeltaBadge delta={stats.leadsDelta} />
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-4 lg:grid-cols-7">
        {/* Recent Activity */}
        <Card className="col-span-full lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity yet.</p>
            ) : (
              <div className="space-y-3">
                {stats.activity.map((item: { type: string; id: string; label: string; detail: string; at: Date }, i: number) => (
                  <Link key={i} href={ACTIVITY_HREF[item.type](item.id)} className="flex items-center rounded-md px-1 py-0.5 -mx-1 hover:bg-accent transition-colors">
                    <span className="relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full">
                      <div className={`flex h-full w-full items-center justify-center ${ACTIVITY_ICON_CLASS[item.type]}`}>
                        {ACTIVITY_ICON[item.type]}
                      </div>
                    </span>
                    <div className="ml-3 space-y-0.5 min-w-0">
                      <p className="text-sm font-medium leading-none truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.detail}</p>
                    </div>
                    <div className="ml-auto pl-3 text-xs text-muted-foreground whitespace-nowrap">{timeAgo(item.at)}</div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right column: Web Traffic + Lead Scraper + Tickets */}
        <div className="col-span-full lg:col-span-3 space-y-4">
          <WebTrafficCard />
          <LeadScraperCard />
          <TroubleTicketCard initialTickets={tickets as any} />
        </div>
      </div>
    </div>
  );
}
