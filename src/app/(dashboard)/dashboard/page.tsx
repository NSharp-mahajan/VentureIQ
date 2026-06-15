import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, BarChart3, Bookmark, ArrowRight } from "lucide-react";
import Link from "next/link";

const RECENT_REPORTS = [
  { id: "1", name: "Acme Corp Due Diligence", industry: "SaaS", date: "2 hrs ago", status: "Completed" },
  { id: "2", name: "Stark Industries Analysis", industry: "Manufacturing", date: "Yesterday", status: "In Progress" },
  { id: "3", name: "Wayne Enterprises", industry: "Tech", date: "3 days ago", status: "Completed" },
];

export default async function DashboardPage() {
  const user = await currentUser();
  const userName = user?.firstName || user?.emailAddresses[0]?.emailAddress || "Guest";

  return (
    <div className="space-y-8 w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-heading font-bold text-foreground">
            Welcome back, {userName}
          </h1>
          <p className="text-muted-foreground mt-2">
            Here&apos;s an overview of your recent diligence activity.
          </p>
        </div>
        <Link href="/analysis/new">
          <Button className="gap-2 shadow-sm">
            <Plus className="w-4 h-4" />
            Create New Analysis
          </Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-3 gap-6">
        <Card className="border-border/50 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analyses This Month</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">4</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Reports</CardTitle>
            <Bookmark className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8</div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-heading">Recent Reports</h2>
          <Link href="/reports">
            <Button variant="ghost" className="text-primary gap-1">
              View All <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        <div className="grid gap-4">
          {RECENT_REPORTS.map((report) => (
            <Link key={report.id} href={`/reports/${report.id}`}>
              <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{report.name}</h4>
                      <p className="text-sm text-muted-foreground">{report.industry} • {report.date}</p>
                    </div>
                  </div>
                  <Badge variant={report.status === "Completed" ? "default" : "secondary"}>
                    {report.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
