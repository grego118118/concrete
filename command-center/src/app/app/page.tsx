import { getDashboardStats } from "@/app/actions/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  CreditCard,
  DollarSign,
  Users,
  Plus,
  FileText,
  Briefcase,
  ArrowUpRight,
} from "lucide-react";
import Link from "next/link";
import { LeadScraperCard } from "@/components/dashboard/lead-scraper-card";

export default async function Home() {
  const stats = await getDashboardStats();

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/app/crm/quotes/new">
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Revenue
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${parseFloat(stats.revenue).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </CardContent>
        </Card>

        <Link href="/app/crm/jobs" className="block transition-opacity hover:opacity-80">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Jobs
              </CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.jobsCount}</div>
              <p className="text-xs text-muted-foreground">
                +180.1% from last month
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/crm/quotes" className="block transition-opacity hover:opacity-80">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Quotes
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.quotesCount}</div>
              <p className="text-xs text-muted-foreground">
                +19% from last month
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/app/crm/leads" className="block transition-opacity hover:opacity-80">
          <Card className="cursor-pointer hover:bg-accent/50 transition-colors h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                New Leads
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.leadsCount}</div>
              <p className="text-xs text-muted-foreground">
                +201 since last hour
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              You made 265 sales this month.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              <div className="flex items-center">
                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                  <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                    <Users className="h-4 w-4" />
                  </div>
                </span>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Olivia Martin</p>
                  <p className="text-xs text-muted-foreground">
                    New customer added
                  </p>
                </div>
                <div className="ml-auto font-medium">Just now</div>
              </div>
              <div className="flex items-center">
                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                  <div className="flex h-full w-full items-center justify-center bg-secondary text-secondary-foreground">
                    <Briefcase className="h-4 w-4" />
                  </div>
                </span>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">Garage Floor Coating</p>
                  <p className="text-xs text-muted-foreground">
                    Job scheduled for tomorrow
                  </p>
                </div>
                <div className="ml-auto font-medium">2m ago</div>
              </div>
              <div className="flex items-center">
                <span className="relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full">
                  <div className="flex h-full w-full items-center justify-center bg-destructive text-destructive-foreground">
                    <Activity className="h-4 w-4" />
                  </div>
                </span>
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">System Alert</p>
                  <p className="text-xs text-muted-foreground">
                    Database backup completed
                  </p>
                </div>
                <div className="ml-auto font-medium">5m ago</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="col-span-3">
          <LeadScraperCard />
        </div>
      </div>

    </div>
  );
}
