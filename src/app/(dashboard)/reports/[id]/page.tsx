"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, ArrowLeft, Loader2, BrainCircuit, AlertCircle, CheckCircle, TrendingUp, AlertTriangle, FileText, Swords, ShieldAlert, BarChart3, Target, Shield, Zap, Scale } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { IReport } from "@/types/report";
import dynamic from "next/dynamic";

const ExportPDFButton = dynamic(() => import("@/components/pdf/ExportPDFButton"), { ssr: false });

export default function ReportPage() {
  const params = useParams();
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
          <h1 className="text-3xl font-bold font-heading">{report.companyName}</h1>
          <p className="text-muted-foreground">
            Due Diligence Report • Generated on {new Date(report.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="sm:ml-auto flex gap-2 w-full sm:w-auto">
          <Button variant="outline" className="flex-1 sm:flex-none"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          <ExportPDFButton report={report} />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-border/50 shadow-sm">
          <CardContent className="p-4 flex flex-col justify-center items-center text-center">
            <div className="text-sm font-medium text-muted-foreground mb-1">Investment Score</div>
            <div className="text-3xl font-bold text-primary">{reportData?.investmentScore || report.aiScore || 0}/100</div>
          </CardContent>
        </Card>
        <Card className="border-border/50 shadow-sm col-span-1 md:col-span-3">
          <CardContent className="p-4 flex items-center h-full">
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{report.industry || "N/A"}</Badge>
              <Badge variant="secondary">{report.analysisType}</Badge>
              {reportData?.keyInsights?.slice(0, 2).map((insight, i) => (
                <Badge key={i} variant="outline" className="text-primary border-primary/20 bg-primary/5">
                  Insight: {insight.substring(0, 40)}...
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
              <CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap">
                {reportData?.executiveSummary || "No executive summary available yet."}
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" /> Key Insights
                </CardTitle>
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
                    <div key={idx} className="border border-border/50 rounded-lg p-4 bg-secondary/5">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-5 h-5 text-primary" />
                        <h4 className="font-semibold text-sm">{doc.fileName}</h4>
                      </div>
                      <div className="bg-background border border-border/30 p-3 rounded text-xs text-muted-foreground max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                        {doc.extractedText || "No text could be extracted from this document."}
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
              <CardHeader><CardTitle>Market Analysis</CardTitle></CardHeader>
              <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap">
                {reportData?.marketAnalysis || "No market analysis available yet."}
              </CardContent>
            </Card>
            <Card className="border-border/50 shadow-sm">
              <CardHeader><CardTitle>Risk Assessment</CardTitle></CardHeader>
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
                <div className="grid md:grid-cols-2 gap-4">
                  {reportData.growthOpportunities.map((opp, idx) => (
                    <div key={idx} className="border border-border/50 p-4 rounded-lg bg-primary/5">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">{opp.title}</h4>
                        <Badge variant="outline" className="bg-background text-xs capitalize">{opp.timeframe.replace('-', ' ')}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{opp.description}</p>
                    </div>
                  ))}
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
                <div className="space-y-6 max-w-2xl">
                  {[
                    { label: "Market Opportunity", value: reportData.scoreBreakdown.marketOpportunity, icon: Target },
                    { label: "Product Strength", value: reportData.scoreBreakdown.productStrength, icon: Zap },
                    { label: "Scalability", value: reportData.scoreBreakdown.scalability, icon: TrendingUp },
                    { label: "Competitive Moat", value: reportData.scoreBreakdown.competitiveMoat, icon: Shield },
                    { label: "Risk Level", value: reportData.scoreBreakdown.riskLevel, icon: Scale },
                  ].map((stat, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <stat.icon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{stat.label}</span>
                        </div>
                        <span className="font-bold text-sm">{stat.value}/100</span>
                      </div>
                      <div className="h-2 w-full bg-secondary/30 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${stat.value >= 80 ? 'bg-green-500' : stat.value >= 60 ? 'bg-blue-500' : stat.value >= 40 ? 'bg-amber-500' : 'bg-red-500'}`} 
                          style={{ width: `${stat.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
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
                {reportData?.investmentVerdict && (
                  <Badge className="text-base py-1 px-4 self-start sm:self-auto bg-primary text-primary-foreground">
                    {reportData.investmentVerdict.label}
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {reportData?.investmentVerdict && (
                <p className="text-lg font-medium">
                  {reportData.investmentVerdict.summary}
                </p>
              )}
              <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap font-medium">
                {reportData?.recommendation || "No recommendations available yet."}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
