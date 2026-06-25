import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, BarChart3, TrendingUp, ArrowRight, Target } from "lucide-react";
import Link from "next/link";
import { VerdictDistributionChart } from "@/components/analytics/VerdictDistributionChart";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { getVerdictLabel, getVerdictBadgeClass, getVerdictChartColor, VerdictType } from "@/lib/verdicts";

export default async function DashboardPage() {
  let user = null;
  try {
    user = await currentUser();
  } catch (error) {
    console.error("Error fetching user from Clerk:", error);
  }
  
  if (!user) return null;

  await connectDB();
  
  // Fetch all user reports, sorted by newest, excluding soft-deleted
  const allReports = await Report.find({ 
    userId: user.id,
    deletedAt: null
  }).sort({ createdAt: -1 }).lean();
  
  const userName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress || "Guest";

  // Calculate metrics
  const totalReports = allReports.length;
  
  const completedReports = allReports.filter(r => r.status === "completed" && (r.aiScore || r.reportData?.investmentScore));
  
  const avgScore = completedReports.length > 0
    ? Math.round(completedReports.reduce((acc, r) => acc + (r.aiScore || r.reportData?.investmentScore || 0), 0) / completedReports.length)
    : 0;
    
  const highestScore = completedReports.length > 0
    ? Math.max(...completedReports.map(r => r.aiScore || r.reportData?.investmentScore || 0))
    : 0;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0,0,0,0);
  const reportsThisMonth = allReports.filter(r => new Date(r.createdAt) >= startOfMonth).length;

  // Chart Data: Verdict Distribution
  const verdicts = completedReports.reduce((acc: Record<string, number>, r) => {
    const verdictKey = r.verdict || "UNKNOWN";
    acc[verdictKey] = (acc[verdictKey] || 0) + 1;
    return acc;
  }, {});

  const verdictChartData = Object.keys(verdicts).map(key => ({
    name: getVerdictLabel(key as VerdictType),
    value: verdicts[key],
    color: getVerdictChartColor(key as VerdictType)
  }));

  // Chart Data: Score Trend (Last 10)
  const scoreTrendData = completedReports.slice(0, 10).reverse().map(r => ({
    name: r.companyName,
    score: r.aiScore || r.reportData?.investmentScore || 0
  }));

  const recentReports = allReports.slice(0, 3);

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

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-border/50 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalReports}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgScore}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Score</CardTitle>
            <Target className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{highestScore}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{reportsThisMonth}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Verdict Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {verdictChartData.length > 0 ? (
              <VerdictDistributionChart data={verdictChartData} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Not enough data to display
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Scores Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {scoreTrendData.length > 0 ? (
              <ScoreTrendChart data={scoreTrendData} />
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Not enough data to display
              </div>
            )}
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
          {recentReports.length > 0 ? recentReports.map((report) => (
            <Link key={report._id.toString()} href={`/reports/${report._id}`}>
              <Card className="hover:border-primary/40 hover:shadow-md transition-all cursor-pointer">
                <CardContent className="p-4 sm:p-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">{report.companyName}</h4>
                        {report.verdict && report.status === "completed" && (
                          <Badge className={getVerdictBadgeClass(report.verdict)} variant="outline">
                            {getVerdictLabel(report.verdict)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{report.industry || "Unknown Industry"}</span>
                        <span>•</span>
                        <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                        {report.aiScore ? (
                          <>
                            <span>•</span>
                            <span className="font-medium text-foreground">Score: {report.aiScore}</span>
                          </>
                        ) : null}
                      </p>
                    </div>
                  </div>
                  <Badge variant={report.status === "completed" ? "default" : report.status === "failed" ? "destructive" : "secondary"} className="capitalize shrink-0 ml-4">
                    {report.status}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          )) : (
            <p className="text-sm text-muted-foreground border border-dashed rounded-lg p-8 text-center bg-secondary/10">No reports generated yet. Start your first analysis!</p>
          )}
        </div>
      </div>
    </div>
  );
}
