"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FileText, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getVerdictLabel, getVerdictBadgeClass } from "@/lib/verdicts";
import { ReportActionMenu, ReportActionType } from "@/components/common/ReportActionMenu";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import { IReport } from "@/types/report";

export function DashboardRecentReports({ initialReports }: { initialReports: IReport[] }) {
  const [reports, setReports] = useState<IReport[]>(initialReports);
  const router = useRouter();

  async function handleAction(reportId: string, action: ReportActionType) {
    try {
      setReports(prev => prev.map(r => {
        if (r._id === reportId) {
          if (action === "save") return { ...r, isSaved: true };
          if (action === "unsave") return { ...r, isSaved: false };
          if (action === "archive") return { ...r, isArchived: true };
          if (action === "unarchive") return { ...r, isArchived: false };
          if (action === "delete") return { ...r, deletedAt: new Date() };
        }
        return r;
      }));

      const res = await fetch(`/api/reports/${reportId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      if (!data.success) {
        toast.error(data.error || "Action failed");
        router.refresh(); 
      } else {
        toast.success(`Report ${action}d successfully.`);
        if (action === "delete") {
           setReports(prev => prev.filter(r => r._id !== reportId));
        }
      }
    } catch {
      toast.error("An error occurred.");
      router.refresh();
    }
  }

  const visibleReports = reports.filter(r => !r.deletedAt).slice(0, 3);

  return (
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
        {visibleReports.length > 0 ? visibleReports.map((report) => (
          <Card key={report._id as string} className="hover:border-primary/40 hover:shadow-md transition-all">
            <CardContent className="p-4 sm:p-6 flex items-center justify-between gap-4">
              <Link href={`/reports/${report._id}`} className="flex items-center gap-4 flex-1">
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
                  <p className="text-sm text-muted-foreground flex flex-wrap items-center gap-2">
                    <span>{report.industry || "Unknown Industry"}</span>
                    <span>•</span>
                    <span>{new Date(report.createdAt).toLocaleDateString()}</span>
                    {report.aiScore || report.reportData?.investmentScore ? (
                      <>
                        <span>•</span>
                        <span className="font-medium text-foreground">
                          Score: {report.aiScore || report.reportData?.investmentScore}
                        </span>
                      </>
                    ) : null}
                  </p>
                </div>
              </Link>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant={report.status === "completed" ? "default" : report.status === "failed" ? "destructive" : "secondary"} className="capitalize hidden sm:inline-flex">
                  {report.status}
                </Badge>
                <ReportActionMenu 
                  isSaved={!!report.isSaved}
                  isArchived={!!report.isArchived}
                  onAction={(action) => handleAction(report._id as string, action)}
                />
              </div>
            </CardContent>
          </Card>
        )) : (
          <EmptyState 
            icon={<FileText className="w-8 h-8" />}
            title="No Recent Reports"
            description="You haven't generated any reports yet, or they have all been archived."
            action={
              <Link href="/analysis/new">
                <Button>Create New Analysis</Button>
              </Link>
            }
          />
        )}
      </div>
    </div>
  );
}
