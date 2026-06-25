"use client";

import { useEffect, useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Search, Loader2, FileText, BarChart3, AlertTriangle, ShieldCheck, MoreHorizontal, Bookmark, BookmarkPlus, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { IReport } from "@/types/report";
import { getVerdictBadgeClass, getVerdictLabel } from "@/lib/verdicts";

export default function ReportsPage() {
  const [reports, setReports] = useState<IReport[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filterVerdict, setFilterVerdict] = useState("all");
  const [viewFilter, setViewFilter] = useState("active");

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports");
        const data = await res.json();
        if (data.success) {
          setReports(data.reports);
        } else {
          toast.error(data.error || "Failed to load reports");
        }
      } catch {
        toast.error("An error occurred while fetching reports.");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  async function handleAction(reportId: string, action: string) {
    try {
      // Optimistic update
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
        const fetchRes = await fetch("/api/reports");
        const fetchData = await fetchRes.json();
        if (fetchData.success) setReports(fetchData.reports);
      } else {
        toast.success(`Report ${action}d successfully.`);
      }
    } catch {
      toast.error("An error occurred.");
      // We could revert optimistic update here, but a refresh might be safer
      const res = await fetch("/api/reports");
      const data = await res.json();
      if (data.success) setReports(data.reports);
    }
  }

  // Filter out completely deleted reports from memory
  const visibleReports = reports.filter(r => !r.deletedAt);
  const activeCompletedReports = visibleReports.filter(r => r.status === "completed" && !r.isArchived);

  const avgScore = activeCompletedReports.length > 0
    ? Math.round(activeCompletedReports.reduce((acc, r) => acc + (r.aiScore || r.reportData?.investmentScore || 0), 0) / activeCompletedReports.length)
    : 0;
  
  const highRiskCount = activeCompletedReports.filter(r => r.verdict === "AVOID" || r.verdict === "CAUTION").length;
  const strongCandidateCount = activeCompletedReports.filter(r => r.verdict === "STRONG_BUY" || r.verdict === "BUY").length;

  const filteredAndSortedReports = useMemo(() => {
    let result = [...visibleReports];

    // 1. View Filter
    if (viewFilter === "active") {
      result = result.filter(r => !r.isArchived);
    } else if (viewFilter === "saved") {
      result = result.filter(r => r.isSaved);
    } else if (viewFilter === "archived") {
      result = result.filter(r => r.isArchived);
    }

    // 2. Search Query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.companyName.toLowerCase().includes(q) || 
        (r.industry && r.industry.toLowerCase().includes(q))
      );
    }

    // 3. Verdict Filter
    if (filterVerdict !== "all") {
      result = result.filter(r => (r.verdict || "UNKNOWN") === filterVerdict);
    }

    // 4. Sorting
    result.sort((a, b) => {
      if (sortBy === "newest") {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === "oldest") {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortBy === "highest_score") {
        const scoreA = a.aiScore || a.reportData?.investmentScore || 0;
        const scoreB = b.aiScore || b.reportData?.investmentScore || 0;
        return scoreB - scoreA;
      }
      return 0;
    });

    return result;
  }, [visibleReports, searchQuery, filterVerdict, sortBy, viewFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Reports Library</h1>
          <p className="text-muted-foreground">Access and manage all your generated due diligence reports.</p>
        </div>
        <Link href="/analysis/new">
          <Button>New Analysis</Button>
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border/50 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeCompletedReports.length}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgScore}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk (Active)</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highRiskCount}</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm bg-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Strong Candidates</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{strongCandidateCount}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border border-border/50 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search companies or industries..." 
            className="pl-9 w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
          <Select value={viewFilter} onValueChange={(value) => setViewFilter(value || "active")}>
            <SelectTrigger className="w-full sm:w-[130px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="saved">Saved Only</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
              <SelectItem value="all">All Reports</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterVerdict} onValueChange={(value) => setFilterVerdict(value || "all")}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Verdict" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Verdicts</SelectItem>
              <SelectItem value="STRONG_BUY">Strong Buy</SelectItem>
              <SelectItem value="BUY">Buy</SelectItem>
              <SelectItem value="HOLD">Hold</SelectItem>
              <SelectItem value="CAUTION">Caution</SelectItem>
              <SelectItem value="AVOID">Avoid</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={(value) => setSortBy(value || "newest")}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="highest_score">Highest Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-border/50 rounded-lg bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Verdict</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <Loader2 className="w-6 h-6 animate-spin mx-auto text-muted-foreground" />
                </TableCell>
              </TableRow>
            ) : filteredAndSortedReports.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                  No reports match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedReports.map((report) => (
                <TableRow key={report._id} className="hover:bg-secondary/10 group">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Link href={`/reports/${report._id}`} className="hover:underline">
                        {report.companyName}
                      </Link>
                      {report.isSaved && <Bookmark className="w-3.5 h-3.5 text-primary fill-primary" />}
                      {report.isArchived && <Archive className="w-3.5 h-3.5 text-muted-foreground" />}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{report.industry || "Unknown"}</Badge></TableCell>
                  <TableCell>
                    <span className="font-semibold">{report.aiScore || report.reportData?.investmentScore || "-"}</span>
                  </TableCell>
                  <TableCell>
                    {report.verdict ? (
                      <Badge className={getVerdictBadgeClass(report.verdict)} variant="outline">
                        {getVerdictLabel(report.verdict)}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={report.status === "completed" ? "default" : report.status === "failed" ? "destructive" : "secondary"}>
                      {report.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">{new Date(report.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/reports/${report._id}`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                      <DropdownMenu>
                        <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "sm", className: "w-8 h-8 p-0" })}>
                          <MoreHorizontal className="w-4 h-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleAction(report._id, report.isSaved ? "unsave" : "save")}>
                            {report.isSaved ? <Bookmark className="w-4 h-4 mr-2" /> : <BookmarkPlus className="w-4 h-4 mr-2" />}
                            {report.isSaved ? "Unsave" : "Save"}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleAction(report._id, report.isArchived ? "unarchive" : "archive")}>
                            {report.isArchived ? <ArchiveRestore className="w-4 h-4 mr-2" /> : <Archive className="w-4 h-4 mr-2" />}
                            {report.isArchived ? "Unarchive" : "Archive"}
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => handleAction(report._id, "delete")}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
