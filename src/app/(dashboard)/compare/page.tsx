/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect } from "react";
import { 
  GitCompare, Loader2, Download, Trophy, Target, Zap, 
  ShieldAlert, TrendingUp, Presentation, AlertCircle, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { 
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, 
  ResponsiveContainer, Tooltip, Legend 
} from "recharts";
import { getVerdictBadgeClass, getVerdictLabel } from "@/lib/verdicts";

interface ReportOption {
  _id: string;
  companyName: string;
  aiScore: number;
  verdict: string;
}

export default function ComparePage() {
  const [reports, setReports] = useState<ReportOption[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  
  const [selectedA, setSelectedA] = useState<string>("");
  const [selectedB, setSelectedB] = useState<string>("");
  
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonResult, setComparisonResult] = useState<any>(null);
  const [isPdfLoading, setIsPdfLoading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!comparisonResult) return;
    try {
      setIsPdfLoading(true);
      const { pdf } = await import('@react-pdf/renderer');
      const { ComparisonPDF } = await import('@/components/compare/ComparisonPDF');
      
      const blob = await pdf(<ComparisonPDF {...comparisonResult} />).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${comparisonResult.reportA.companyName}-vs-${comparisonResult.reportB.companyName}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error("Failed to generate PDF");
    } finally {
      setIsPdfLoading(false);
    }
  };

  useEffect(() => {
    async function fetchReports() {
      try {
        const res = await fetch("/api/reports/list");
        const data = await res.json();
        if (data.success) {
          setReports(data.reports);
        } else {
          toast.error("Failed to load reports");
        }
      } catch (error) {
        toast.error("Error connecting to server");
      } finally {
        setLoadingList(false);
      }
    }
    fetchReports();
  }, []);

  const handleCompare = async () => {
    if (!selectedA || !selectedB) {
      toast.error("Please select two companies to compare");
      return;
    }
    if (selectedA === selectedB) {
      toast.error("Please select two different companies");
      return;
    }

    setIsComparing(true);
    setComparisonResult(null);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportIdA: selectedA, reportIdB: selectedB })
      });
      const data = await res.json();
      
      if (data.success) {
        setComparisonResult(data);
        toast.success("Comparison completed successfully");
      } else {
        toast.error(data.error || "Failed to compare companies");
      }
    } catch (error) {
      toast.error("An error occurred during comparison");
    } finally {
      setIsComparing(false);
    }
  };

  const getRadarData = (result: any) => {
    const defaultData = [
      { subject: 'Market', A: 0, B: 0, fullMark: 100 },
      { subject: 'Product', A: 0, B: 0, fullMark: 100 },
      { subject: 'Scalability', A: 0, B: 0, fullMark: 100 },
      { subject: 'Moat', A: 0, B: 0, fullMark: 100 },
      { subject: 'Risk', A: 0, B: 0, fullMark: 100 },
    ];
    
    if (!result) return defaultData;

    const parseScore = (val: any) => {
      if (typeof val === 'number') return val;
      if (val && typeof val.score === 'number') return val.score;
      return 0;
    };

    return [
      { 
        subject: 'Market', 
        A: parseScore(result.reportA.scoreBreakdown?.marketOpportunity), 
        B: parseScore(result.reportB.scoreBreakdown?.marketOpportunity), 
        fullMark: 100 
      },
      { 
        subject: 'Product', 
        A: parseScore(result.reportA.scoreBreakdown?.productStrength), 
        B: parseScore(result.reportB.scoreBreakdown?.productStrength), 
        fullMark: 100 
      },
      { 
        subject: 'Scalability', 
        A: parseScore(result.reportA.scoreBreakdown?.scalability), 
        B: parseScore(result.reportB.scoreBreakdown?.scalability), 
        fullMark: 100 
      },
      { 
        subject: 'Moat', 
        A: parseScore(result.reportA.scoreBreakdown?.competitiveMoat), 
        B: parseScore(result.reportB.scoreBreakdown?.competitiveMoat), 
        fullMark: 100 
      },
      { 
        subject: 'Low Risk', 
        A: parseScore(result.reportA.scoreBreakdown?.riskLevel), 
        B: parseScore(result.reportB.scoreBreakdown?.riskLevel), 
        fullMark: 100 
      },
    ];
  };

  return (
    <div className="flex-1 space-y-6 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 w-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading tracking-tight flex items-center gap-2">
            <GitCompare className="w-8 h-8 text-indigo-500" />
            Company Comparison
          </h1>
          <p className="text-muted-foreground mt-1">
            Compare two companies head-to-head using AI.
          </p>
        </div>
        
        {comparisonResult && (
          <Button variant="outline" disabled={isPdfLoading} onClick={handleDownloadPDF}>
            {isPdfLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
            {isPdfLoading ? 'Generating PDF...' : 'Export PDF'}
          </Button>
        )}
      </div>

      <Card className="bg-card shadow-sm border-border/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-6 items-end">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Company A</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedA}
                onChange={(e) => setSelectedA(e.target.value)}
                disabled={loadingList || isComparing}
              >
                <option value="">Select a company...</option>
                {reports.map(r => (
                  <option key={r._id} value={r._id} disabled={r._id === selectedB}>
                    {r.companyName}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-center pb-2 px-2 hidden md:flex text-muted-foreground font-bold font-heading">
              VS
            </div>
            
            {/* Mobile VS indicator */}
            <div className="flex items-center justify-center md:hidden text-muted-foreground font-bold font-heading my-2">
              VS
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Company B</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={selectedB}
                onChange={(e) => setSelectedB(e.target.value)}
                disabled={loadingList || isComparing}
              >
                <option value="">Select a company...</option>
                {reports.map(r => (
                  <option key={r._id} value={r._id} disabled={r._id === selectedA}>
                    {r.companyName}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <Button 
              onClick={handleCompare} 
              disabled={!selectedA || !selectedB || isComparing}
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isComparing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  AI is analyzing...
                </>
              ) : (
                <>
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare Head-to-Head
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {comparisonResult && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          
          {/* Winner Banner */}
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-1 shadow-lg">
            <div className="bg-background/90 backdrop-blur-sm rounded-lg p-6 text-center border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="w-24 h-24" />
              </div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 mb-1">Overall Winner</h2>
              <p className="text-4xl font-black font-heading bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                {comparisonResult.comparison.finalWinner}
              </p>
              <div className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground">
                <Target className="w-4 h-4 text-emerald-500" /> 
                AI Confidence: {comparisonResult.comparison.confidenceScore}%
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Radar Chart */}
            <Card className="lg:col-span-1 shadow-sm border-border/50">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={getRadarData(comparisonResult)}>
                    <PolarGrid stroke="currentColor" className="text-border/50" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'currentColor', fontSize: 12 }} className="text-muted-foreground" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name={comparisonResult.reportA.companyName} dataKey="A" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.3} />
                    <Radar name={comparisonResult.reportB.companyName} dataKey="B" stroke="#ec4899" fill="#ec4899" fillOpacity={0.3} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }} />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Scorecards */}
            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="shadow-sm border-border/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-indigo-600" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{comparisonResult.reportA.companyName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-4xl font-black">{comparisonResult.reportA.score}</span>
                    <span className="text-muted-foreground font-medium pb-1">/100</span>
                  </div>
                  <Badge className={`${getVerdictBadgeClass(comparisonResult.reportA.verdict)}`}>
                    {getVerdictLabel(comparisonResult.reportA.verdict)}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="shadow-sm border-border/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-pink-500" />
                <CardHeader className="pb-2">
                  <CardTitle className="text-xl">{comparisonResult.reportB.companyName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-2 mb-4">
                    <span className="text-4xl font-black">{comparisonResult.reportB.score}</span>
                    <span className="text-muted-foreground font-medium pb-1">/100</span>
                  </div>
                  <Badge className={`${getVerdictBadgeClass(comparisonResult.reportB.verdict)}`}>
                    {getVerdictLabel(comparisonResult.reportB.verdict)}
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* AI Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Presentation className="w-4 h-4 text-primary" />
                  Executive Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm leading-relaxed text-muted-foreground">
                {comparisonResult.comparison.executiveComparison}
              </CardContent>
            </Card>
            
            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Investment Recommendation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm leading-relaxed text-muted-foreground">
                {comparisonResult.comparison.investmentRecommendation}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  Strengths Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm leading-relaxed text-muted-foreground">
                {comparisonResult.comparison.strengthsComparison}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Weaknesses Breakdown
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm leading-relaxed text-muted-foreground">
                {comparisonResult.comparison.weaknessesComparison}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Market Comparison
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm leading-relaxed text-muted-foreground">
                {comparisonResult.comparison.marketComparison}
              </CardContent>
            </Card>

            <Card className="shadow-sm border-border/50">
              <CardHeader className="pb-3 border-b border-border/50 bg-secondary/10">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-primary" />
                  Competitive Advantage & Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm leading-relaxed text-muted-foreground space-y-4">
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Moat:</h4>
                  <p>{comparisonResult.comparison.competitiveAdvantage}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Risks:</h4>
                  <p>{comparisonResult.comparison.riskComparison}</p>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      )}
    </div>
  );
}

