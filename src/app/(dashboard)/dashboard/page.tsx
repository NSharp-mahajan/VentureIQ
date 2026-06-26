import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, BarChart3, TrendingUp, ArrowRight, Target, Bookmark, Archive, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { VerdictDistributionChart } from "@/components/analytics/VerdictDistributionChart";
import { ScoreTrendChart } from "@/components/analytics/ScoreTrendChart";
import { getVerdictLabel, getVerdictChartColor, VerdictType } from "@/lib/verdicts";
import { StatCard } from "@/components/dashboard/StatCard";
import { DashboardRecentReports } from "@/components/dashboard/DashboardRecentReports";

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

  const savedReports = allReports.filter(r => r.isSaved).length;
  const archivedReports = allReports.filter(r => r.isArchived).length;
  const strongBuyCount = completedReports.filter(r => r.verdict === "STRONG_BUY").length;
  const strongBuyPercent = completedReports.length > 0 ? Math.round((strongBuyCount / completedReports.length) * 100) : 0;

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

  // We pass a serialized version of reports to the client component to prevent errors
  // Using JSON.parse(JSON.stringify()) ensures all nested ObjectIds and Dates are converted to primitive strings
  const recentReports = JSON.parse(JSON.stringify(allReports.slice(0, 5)));

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
        <StatCard title="Total Reports" value={totalReports} icon={<FileText className="w-4 h-4" />} isNumeric />
        <StatCard title="Avg Investment Score" value={avgScore} icon={<BarChart3 className="w-4 h-4" />} isNumeric />
        <StatCard title="Highest Score" value={highestScore} icon={<Target className="w-4 h-4" />} isNumeric />
        <StatCard title="Reports This Month" value={reportsThisMonth} icon={<TrendingUp className="w-4 h-4" />} isNumeric />
        <StatCard title="Saved Reports" value={savedReports} icon={<Bookmark className="w-4 h-4" />} isNumeric />
        <StatCard title="Archived Reports" value={archivedReports} icon={<Archive className="w-4 h-4" />} isNumeric />
        <StatCard title="Strong Buy %" value={`${strongBuyPercent}%`} icon={<ShieldCheck className="w-4 h-4" />} isNumeric={false} />
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

      <DashboardRecentReports initialReports={recentReports as any} />
    </div>
  );
}
