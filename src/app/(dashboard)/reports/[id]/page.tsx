"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Share2, ArrowLeft, Loader2, BrainCircuit, AlertCircle, CheckCircle, TrendingUp, AlertTriangle, FileText, Swords, ShieldAlert, BarChart3, Target, Shield, Zap, Scale, MoreVertical, Bookmark, BookmarkPlus, Archive, ArchiveRestore, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { IReport } from "@/types/report";
import { ScoreBreakdownChart } from "@/components/analytics/ScoreBreakdownChart";
import { getVerdictBadgeClass, getVerdictLabel, VerdictType } from "@/lib/verdicts";
import { ReportActionMenu, ReportActionType } from "@/components/common/ReportActionMenu";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import dynamic from "next/dynamic";

const ExportPDFButton = dynamic(() => import("@/components/pdf/ExportPDFButton"), { ssr: false });

export default function ReportPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [report, setReport] = useState<IReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${id}`);
        const data = await res.json();
        
        if (!mounted) return;

        if (data.success) {
          setReport(data.report);
          setLoading(false);
        } else {
          toast.error(data.error || "Failed to load report");
          setLoading(false);
        }
      } catch {
        if (mounted) {
          toast.error("An error occurred while fetching the report.");
          setLoading(false);
        }
      }
    }
    
    if (id && !report) {
       fetchReport();
    }
    
    // Auto-refresh if processing
    let intervalId: NodeJS.Timeout;
    if (report?.status === "processing") {
      intervalId = setInterval(() => {
        fetchReport();
      }, 3000); // Check every 3 seconds
    }
    
    return () => {
      mounted = false;
      if (intervalId) clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, report?.status]);

  async function handleAction(action: ReportActionType) {
    if (!report) return;
    try {
      if (action === "delete") {
        const confirmed = confirm("Are you sure you want to delete this report?");
        if (!confirmed) return;
      }

      // Optimistic update
      setReport(prev => {
        if (!prev) return prev;
        if (action === "save") return { ...prev, isSaved: true };
        if (action === "unsave") return { ...prev, isSaved: false };
        if (action === "archive") return { ...prev, isArchived: true };
        if (action === "unarchive") return { ...prev, isArchived: false };
        return prev;
      });

      const res = await fetch(`/api/reports/${report._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      
      if (!data.success) {
        toast.error(data.error || "Action failed");
        // We could revert optimistic update here, but a refresh might be safer
      } else {
        toast.success(`Report ${action}d successfully.`);
        if (action === "delete") {
          router.push("/reports");
        } else {
          setReport(data.report); // sync with DB
        }
      }
    } catch (error) {
      toast.error("An error occurred.");
    }
  }

  if (loading && !report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading report data...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <p className="text-muted-foreground">Report not found.</p>
        <Link href="/reports">
          <Button variant="outline">Back to Reports</Button>
        </Link>
      </div>
    );
  }

  if (report.status === "processing") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center animate-pulse">
          <BrainCircuit className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-heading">AI is Analyzing {report.companyName}</h2>
          <p className="text-muted-foreground">
            Our AI engine is currently researching the market, analyzing risks, and formulating recommendations. This usually takes 10-30 seconds.
          </p>
        </div>
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (report.status === "failed") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center max-w-md mx-auto">
        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold font-heading">Analysis Failed</h2>
          <p className="text-muted-foreground">
            {report.errorMessage || "An unexpected error occurred during the AI generation process."}
          </p>
        </div>
        <Link href="/reports">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-2" /> Back to Library</Button>
        </Link>
      </div>
    );
  }

  const { reportData } = report;

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold font-heading">{report.companyName}</h1>
            {report.verdict && (
              <Badge className={`${getVerdictBadgeClass(report.verdict)} text-xs px-2 py-0.5 mt-1`} variant="outline">
                {getVerdictLabel(report.verdict)}
              </Badge>
            )}
            {report.isSaved && <Bookmark className="w-5 h-5 text-primary fill-primary mt-1" />}
            {report.isArchived && <Archive className="w-5 h-5 text-muted-foreground mt-1" />}
          </div>
          <p className="text-muted-foreground">
            Due Diligence Report • Generated on {new Date(report.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2 w-full sm:w-auto items-center">
          <Button variant="outline" className="flex-1 sm:flex-none"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          <ExportPDFButton report={report} />
          
          <ReportActionMenu 
            isSaved={!!report.isSaved}
            isArchived={!!report.isArchived}
            onAction={(action) => handleAction(action)}
            triggerVariant="outline"
            triggerSize="icon"
            triggerIcon={<MoreVertical className="w-4 h-4" />}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-border/50 shadow-sm relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
          <CardContent className="p-6 flex flex-col justify-center items-center text-center relative z-10 h-full">
            <div className="text-sm font-medium text-muted-foreground mb-3 font-heading uppercase tracking-wider">Investment Score</div>
            <div className="relative flex items-center justify-center w-24 h-24">
              <svg className="w-full h-full transform -rotate-90 drop-shadow-sm" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" className="text-secondary" />
                <circle 
                  cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" 
                  strokeDasharray={`${2 * Math.PI * 42}`} 
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - (reportData?.investmentScore || report.aiScore || 0) / 100)}`}
                  className="text-primary transition-all duration-1000 ease-out" 
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <span className="text-2xl font-bold text-foreground">
                  <AnimatedCounter value={reportData?.investmentScore || report.aiScore || 0} />
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm col-span-1 md:col-span-3">
          <CardContent className="p-6 flex items-center h-full">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="px-3 py-1 text-sm">{report.industry || "Unknown Industry"}</Badge>
              <Badge variant="secondary" className="px-3 py-1 text-sm">{report.analysisType}</Badge>
              {reportData?.keyInsights?.slice(0, 2).map((insight, i) => (
                <Badge key={i} variant="outline" className="text-primary border-primary/20 bg-primary/5 px-3 py-1 text-sm font-normal">
                  💡 {insight.substring(0, 50)}...
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Metadata & Data Quality Panel */}
      {report.aiMetadata && reportData?.dataQuality && (
        <Card className="border-border/50 shadow-sm mb-6 bg-secondary/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-primary" /> AI Data Quality & Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider">Overall Confidence</p>
                <p className="font-bold flex items-center gap-1">
                  {report.aiMetadata.overallConfidenceScore}%
                  {report.aiMetadata.overallConfidenceScore >= 80 ? (
                    <CheckCircle className="w-3 h-3 text-green-500" />
                  ) : report.aiMetadata.overallConfidenceScore >= 50 ? (
                    <AlertCircle className="w-3 h-3 text-amber-500" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-red-500" />
                  )}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider">Completeness</p>
                <p className="font-semibold capitalize">{reportData.dataQuality.completeness}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider">Sources Analyzed</p>
                <p className="font-semibold">
                  {reportData.dataQuality.websiteAnalyzed ? "Website, " : ""}
                  {reportData.dataQuality.documentsAnalyzed} Document(s)
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground mb-1 text-xs uppercase tracking-wider">AI Generation</p>
                <p className="font-medium text-xs">
                  Model: {report.aiMetadata.modelUsed} <br />
                  Time: {(report.aiMetadata.processingDurationMs / 1000).toFixed(1)}s
                </p>
              </div>
            </div>
            {reportData.dataQuality.missingInfo && reportData.dataQuality.missingInfo.length > 0 && (
              <div className="mt-3 pt-3 border-t border-border/30">
                <p className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Missing Information (Lowered Confidence)</p>
                <div className="flex flex-wrap gap-2">
                  {reportData.dataQuality.missingInfo.map((info, idx) => (
                    <Badge key={idx} variant="outline" className="text-[10px] text-muted-foreground">{info}</Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="executive" className="w-full">
        <TabsList className="mb-4 bg-secondary/20 flex-wrap h-auto p-1">
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
          <TabsTrigger value="intelligence">Company Intelligence</TabsTrigger>
          <TabsTrigger value="documents">Document Intelligence</TabsTrigger>
          <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
          <TabsTrigger value="market">Market & Risks</TabsTrigger>
          <TabsTrigger value="competitors">Competitors</TabsTrigger>
          <TabsTrigger value="risks">Red Flags</TabsTrigger>
          <TabsTrigger value="growth">Growth</TabsTrigger>
          <TabsTrigger value="scores">Scores</TabsTrigger>
          <TabsTrigger value="recommendations">Verdict</TabsTrigger>
        </TabsList>
        
        <TabsContent value="executive">
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border/50 shadow-sm md:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Executive Summary</CardTitle>
                  {reportData?.sourceAttribution?.executiveSummary && (
                    <Badge variant="outline" className="text-xs bg-secondary/20">Sources: {reportData.sourceAttribution.executiveSummary.join(", ")}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap">
                {reportData?.executiveSummary || "No executive summary available yet."}
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-primary" /> Key Insights
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-4">
                  {reportData?.keyInsights?.map((insight, idx) => (
                    <li key={idx} className="flex gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{insight}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="intelligence">
          <div className="grid gap-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader><CardTitle>Website Intelligence</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                {!report.scrapedData ? (
                  <p className="text-muted-foreground text-sm">No website data was provided or successfully extracted for this analysis.</p>
                ) : (
                  <>
                    {report.websiteUrl && (
                      <div>
                        <h4 className="text-sm font-semibold mb-1">Website URL</h4>
                        <a href={report.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-sm break-all">
                          {report.websiteUrl}
                        </a>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Page Title</h4>
                      <p className="text-sm text-muted-foreground">{report.scrapedData.title || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Meta Description</h4>
                      <p className="text-sm text-muted-foreground">{report.scrapedData.description || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-1">Extracted Content Preview</h4>
                      <div className="bg-secondary/20 p-4 rounded-md text-xs text-muted-foreground max-h-[300px] overflow-y-auto whitespace-pre-wrap">
                        {report.scrapedData.content || "No text content extracted."}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents">
          <div className="grid gap-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader><CardTitle>Document Intelligence</CardTitle></CardHeader>
              <CardContent className="space-y-6">
                {!report.documents || report.documents.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No documents were uploaded for this analysis.</p>
                ) : (
                  report.documents.map((doc, idx) => (
                    <div key={idx} className="border border-border/50 rounded-xl overflow-hidden bg-background shadow-sm">
                      <div className="bg-secondary/20 p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold text-base truncate max-w-[200px] sm:max-w-[300px]">{doc.fileName}</h4>
                            <p className="text-xs text-muted-foreground uppercase tracking-wider">{doc.fileType.split('/').pop()} • {doc.sizeBytes ? (doc.sizeBytes / 1024).toFixed(1) + ' KB' : 'Unknown Size'}</p>
                          </div>
                        </div>
                        {doc.metadata && (
                          <div className="flex items-center gap-4 text-xs">
                            <div className="text-center">
                              <p className="text-muted-foreground mb-1 uppercase tracking-wider">Pages</p>
                              <p className="font-semibold">{doc.metadata.pageCount || 1}</p>
                            </div>
                            <div className="text-center border-l border-border/50 pl-4">
                              <p className="text-muted-foreground mb-1 uppercase tracking-wider">Extraction</p>
                              <p className="font-semibold flex items-center justify-center gap-1">
                                {doc.metadata.extractionSuccess ? <CheckCircle className="w-3 h-3 text-green-500" /> : <AlertTriangle className="w-3 h-3 text-red-500" />}
                                {doc.metadata.extractionConfidence}%
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 space-y-4">
                        {doc.analysis ? (
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                              {doc.analysis.executiveSummary && (
                                <div>
                                  <h5 className="text-sm font-bold text-foreground mb-1">Document Summary</h5>
                                  <p className="text-sm text-muted-foreground">{doc.analysis.executiveSummary}</p>
                                </div>
                              )}
                              {doc.analysis.keyBusinessHighlights && doc.analysis.keyBusinessHighlights.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-bold text-foreground mb-1">Key Highlights</h5>
                                  <ul className="space-y-1">
                                    {doc.analysis.keyBusinessHighlights.map((h, i) => (
                                      <li key={i} className="text-xs flex gap-2"><span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" /> {h}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {doc.analysis.missingInformation && doc.analysis.missingInformation.length > 0 && (
                                <div className="p-3 bg-amber-500/5 border border-amber-500/20 rounded-md">
                                  <h5 className="text-xs font-bold text-amber-600 mb-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Missing Context</h5>
                                  <ul className="space-y-1">
                                    {doc.analysis.missingInformation.map((m, i) => <li key={i} className="text-xs text-amber-700/80">• {m}</li>)}
                                  </ul>
                                </div>
                              )}
                            </div>
                            <div className="space-y-4 border-t md:border-t-0 md:border-l border-border/30 pt-4 md:pt-0 md:pl-4">
                              {doc.analysis.financialMentions && doc.analysis.financialMentions.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-bold text-foreground mb-1">Financial Data</h5>
                                  <ul className="space-y-1">
                                    {doc.analysis.financialMentions.map((f, i) => <li key={i} className="text-xs text-muted-foreground">• {f}</li>)}
                                  </ul>
                                </div>
                              )}
                              {doc.analysis.risks && doc.analysis.risks.length > 0 && (
                                <div>
                                  <h5 className="text-sm font-bold text-foreground mb-1">Identified Risks</h5>
                                  <ul className="space-y-1">
                                    {doc.analysis.risks.map((r, i) => <li key={i} className="text-xs text-muted-foreground">• {r}</li>)}
                                  </ul>
                                </div>
                              )}
                              {doc.analysis.teamInformation && (
                                <div>
                                  <h5 className="text-sm font-bold text-foreground mb-1">Team Information</h5>
                                  <p className="text-xs text-muted-foreground">{doc.analysis.teamInformation}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="bg-secondary/5 border border-border/30 p-3 rounded text-xs text-muted-foreground max-h-[150px] overflow-y-auto whitespace-pre-wrap">
                            <p className="font-semibold mb-2">Raw Extracted Text (Legacy):</p>
                            {doc.extractedText || "No text could be extracted from this document."}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="swot">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-sm border-t-4 border-t-green-500">
              <CardHeader>
                <CardTitle className="text-green-600 flex items-center gap-2">
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {reportData?.swot?.strengths?.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm"><CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />{item}</li>
                  )) || <p className="text-muted-foreground text-sm">No strengths identified.</p>}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm border-t-4 border-t-amber-500">
              <CardHeader>
                <CardTitle className="text-amber-600 flex items-center gap-2">
                  Weaknesses
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {reportData?.swot?.weaknesses?.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm"><AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />{item}</li>
                  )) || <p className="text-muted-foreground text-sm">No weaknesses identified.</p>}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm border-t-4 border-t-blue-500">
              <CardHeader>
                <CardTitle className="text-blue-600 flex items-center gap-2">
                  Opportunities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {reportData?.swot?.opportunities?.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm"><TrendingUp className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />{item}</li>
                  )) || <p className="text-muted-foreground text-sm">No opportunities identified.</p>}
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm border-t-4 border-t-red-500">
              <CardHeader>
                <CardTitle className="text-red-600 flex items-center gap-2">
                  Threats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {reportData?.swot?.threats?.map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm"><AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />{item}</li>
                  )) || <p className="text-muted-foreground text-sm">No threats identified.</p>}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market">
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Market Analysis</CardTitle>
                  {reportData?.sourceAttribution?.marketAnalysis && (
                    <Badge variant="outline" className="text-xs bg-secondary/20">Sources: {reportData.sourceAttribution.marketAnalysis.join(", ")}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap">
                {reportData?.marketAnalysis || "No market analysis available yet."}
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Risk Assessment</CardTitle>
                  {reportData?.sourceAttribution?.riskAssessment && (
                    <Badge variant="outline" className="text-xs bg-secondary/20">Sources: {reportData.sourceAttribution.riskAssessment.join(", ")}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap text-destructive/90">
                {reportData?.riskAssessment || "No risk assessment available yet."}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitors">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Swords className="w-5 h-5 text-primary" /> Competitor Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData?.competitorAnalysis ? (
                <div className="space-y-6">
                  <p className="text-sm text-muted-foreground">{reportData.competitorAnalysis.summary}</p>
                  <div className="grid gap-4">
                    {reportData.competitorAnalysis.topCompetitors.map((comp, idx) => (
                      <div key={idx} className="border border-border/50 p-4 rounded-lg bg-secondary/10">
                        <h4 className="font-semibold text-lg">{comp.name}</h4>
                        <p className="text-sm text-muted-foreground mt-1"><span className="font-medium text-foreground">Why:</span> {comp.reason}</p>
                        <p className="text-sm text-muted-foreground mt-1"><span className="font-medium text-foreground">Differentiation:</span> {comp.differentiation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Competitor analysis not available for this report.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card className="border-border/50 shadow-sm border-t-4 border-t-destructive">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive"><ShieldAlert className="w-5 h-5" /> Red Flags & Risks</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData?.redFlags && reportData.redFlags.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-8 p-4 bg-secondary/10 rounded-lg border border-border/50">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Total Flags</p>
                      <p className="text-2xl font-bold">{reportData.redFlags.length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">High Severity</p>
                      <p className="text-xl font-bold text-destructive">{reportData.redFlags.filter(f => f.severity === 'high').length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Medium Severity</p>
                      <p className="text-xl font-bold text-amber-500">{reportData.redFlags.filter(f => f.severity === 'medium').length}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Low Severity</p>
                      <p className="text-xl font-bold text-blue-500">{reportData.redFlags.filter(f => f.severity === 'low').length}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {reportData.redFlags.map((flag, idx) => (
                      <div key={idx} className="flex gap-4 p-4 border border-border/50 rounded-lg">
                        <div className="shrink-0 mt-1">
                          {flag.severity === "high" && <AlertTriangle className="w-5 h-5 text-destructive" />}
                          {flag.severity === "medium" && <AlertCircle className="w-5 h-5 text-amber-500" />}
                          {flag.severity === "low" && <AlertCircle className="w-5 h-5 text-blue-500" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{flag.title}</h4>
                            <Badge variant={flag.severity === "high" ? "destructive" : flag.severity === "medium" ? "secondary" : "outline"} className="text-[10px] uppercase tracking-wider">{flag.severity}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{flag.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No major red flags identified.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-primary" /> Growth Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              {reportData?.growthOpportunities && reportData.growthOpportunities.length > 0 ? (
                <div className="space-y-6">
                  {["short-term", "mid-term", "long-term"].map((timeframe) => {
                    const opps = reportData.growthOpportunities!.filter(o => o.timeframe === timeframe);
                    if (opps.length === 0) return null;
                    return (
                      <div key={timeframe}>
                        <h3 className="font-bold text-lg capitalize mb-3 pb-2 border-b border-border/50 text-foreground/80">{timeframe.replace('-', ' ')}</h3>
                        <div className="grid md:grid-cols-2 gap-4">
                           {opps.map((opp, idx) => (
                            <div key={idx} className="border border-border/50 p-4 rounded-lg bg-primary/5">
                              <h4 className="font-semibold mb-2">{opp.title}</h4>
                              <p className="text-sm text-muted-foreground">{opp.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No specific growth opportunities identified.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scores">
          <Card className="border-border/50 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BarChart3 className="w-5 h-5 text-primary" /> Multi-factor Score Breakdown</CardTitle>
              <CardDescription>Detailed evaluation across 5 critical dimensions (0-100)</CardDescription>
            </CardHeader>
            <CardContent>
              {reportData?.scoreBreakdown ? (
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    {[
                      { label: "Market Opportunity", data: reportData.scoreBreakdown.marketOpportunity, icon: Target },
                      { label: "Product Strength", data: reportData.scoreBreakdown.productStrength, icon: Zap },
                      { label: "Scalability", data: reportData.scoreBreakdown.scalability, icon: TrendingUp },
                      { label: "Competitive Moat", data: reportData.scoreBreakdown.competitiveMoat, icon: Shield },
                      { label: "Risk Level", data: reportData.scoreBreakdown.riskLevel, icon: Scale },
                    ].map((stat, idx) => {
                      const value = typeof stat.data === 'number' ? stat.data : stat.data?.score || 0;
                      const reason = typeof stat.data === 'object' ? stat.data.reason : null;
                      return (
                        <div key={idx}>
                          <div className="flex justify-between items-center mb-1">
                            <div className="flex items-center gap-2">
                              <stat.icon className="w-4 h-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{stat.label}</span>
                            </div>
                            <span className="font-bold text-sm">{value}/100</span>
                          </div>
                          <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden mb-1">
                            <div 
                              className={`h-full rounded-full ${value >= 80 ? 'bg-green-500' : value >= 60 ? 'bg-blue-500' : value >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                              style={{ width: `${value}%` }}
                            />
                          </div>
                          {reason && <p className="text-xs text-muted-foreground leading-snug">{reason}</p>}
                        </div>
                      );
                    })}
                  </div>
                  <div className="hidden lg:block w-full">
                    <ScoreBreakdownChart scoreBreakdown={reportData.scoreBreakdown} />
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Detailed score breakdown is not available for this report.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card className="border-border/50 shadow-sm bg-gradient-to-br from-card to-primary/5">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Final Recommendation</CardTitle>
                  <CardDescription>AI-generated investment verdict</CardDescription>
                </div>
                {report.verdict && report.verdict !== "UNKNOWN" ? (
                  <Badge className={`${getVerdictBadgeClass(report.verdict)} text-base py-1 px-4 self-start sm:self-auto`}>
                    {getVerdictLabel(report.verdict)}
                  </Badge>
                ) : reportData?.investmentVerdict ? (
                  <Badge className="text-base py-1 px-4 self-start sm:self-auto bg-primary text-primary-foreground">
                    {reportData.investmentVerdict.label}
                  </Badge>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {reportData?.investmentVerdict && (
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h3 className="font-semibold text-lg mb-2 text-primary">The Verdict</h3>
                  <p className="text-foreground font-medium">{reportData.investmentVerdict.summary}</p>
                </div>
              )}
              
              {reportData?.investmentVerdict?.reasoning && (
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4 text-muted-foreground" /> AI Reasoning</h4>
                  <p className="text-sm text-muted-foreground leading-relaxed">{reportData.investmentVerdict.reasoning}</p>
                </div>
              )}

              {((reportData?.investmentVerdict?.strengths?.length ?? 0) > 0 || (reportData?.investmentVerdict?.weaknesses?.length ?? 0) > 0) && (
                <div className="grid md:grid-cols-2 gap-4">
                  {reportData?.investmentVerdict?.strengths && reportData.investmentVerdict.strengths.length > 0 && (
                    <div className="border border-green-500/20 bg-green-500/5 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm text-green-600 mb-2">Key Drivers (Strengths)</h4>
                      <ul className="space-y-1">
                        {reportData.investmentVerdict.strengths.map((s, i) => (
                          <li key={i} className="text-xs flex gap-2"><CheckCircle className="w-3 h-3 text-green-500 shrink-0 mt-0.5" /> <span>{s}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {reportData?.investmentVerdict?.weaknesses && reportData.investmentVerdict.weaknesses.length > 0 && (
                    <div className="border border-amber-500/20 bg-amber-500/5 p-4 rounded-lg">
                      <h4 className="font-semibold text-sm text-amber-600 mb-2">Key Concerns (Weaknesses)</h4>
                      <ul className="space-y-1">
                        {reportData.investmentVerdict.weaknesses.map((w, i) => (
                          <li key={i} className="text-xs flex gap-2"><AlertTriangle className="w-3 h-3 text-amber-500 shrink-0 mt-0.5" /> <span>{w}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {reportData?.investmentVerdict?.assumptions && reportData.investmentVerdict.assumptions.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-muted-foreground">Assumptions Made During Analysis</h4>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-muted-foreground">
                    {reportData.investmentVerdict.assumptions.map((a, i) => <li key={i}>{a}</li>)}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-border/50">
                <h4 className="font-semibold mb-3">Detailed Recommendations</h4>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap font-medium">
                  {reportData?.recommendation || "No recommendations available yet."}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
