"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, ArrowLeft, Loader2, BrainCircuit } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { IReport } from "@/types/report";

export default function ReportPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [report, setReport] = useState<IReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(`/api/reports/${id}`);
        const data = await res.json();
        
        if (data.success) {
          setReport(data.report);
        } else {
          toast.error(data.error || "Failed to load report");
        }
      } catch {
        toast.error("An error occurred while fetching the report.");
      } finally {
        setLoading(false);
      }
    }
    
    if (id) fetchReport();
  }, [id]);

  if (loading) {
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
          <h2 className="text-2xl font-bold font-heading">Analysis is being processed</h2>
          <p className="text-muted-foreground">
            Our AI engine is currently analyzing {report.companyName}. This usually takes a few minutes. Check back soon.
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
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
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
        <div className="ml-auto hidden sm:flex gap-2">
          <Button variant="outline"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          <Button><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Badge variant="default" className="bg-green-600/10 text-green-700 hover:bg-green-600/20">
          AI Score: {report.aiScore || 0}/100
        </Badge>
        <Badge variant="secondary">{report.industry || "N/A"}</Badge>
        <Badge variant="secondary">{report.analysisType}</Badge>
      </div>

      <Tabs defaultValue="executive" className="w-full">
        <TabsList className="mb-4 bg-secondary/20 flex-wrap h-auto">
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
          <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="executive">
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none whitespace-pre-wrap">
              {reportData?.executiveSummary || "No executive summary available yet."}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swot">
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle>SWOT Analysis</CardTitle></CardHeader>
            <CardContent className="whitespace-pre-wrap">
              {reportData?.swot || "No SWOT analysis available yet."}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="market">
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle>Market Analysis</CardTitle></CardHeader>
            <CardContent className="whitespace-pre-wrap">
              {reportData?.marketAnalysis || "No market analysis available yet."}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle>Risk Assessment</CardTitle></CardHeader>
            <CardContent className="whitespace-pre-wrap">
              {reportData?.riskAssessment || "No risk assessment available yet."}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle>Final Recommendations</CardTitle></CardHeader>
            <CardContent className="whitespace-pre-wrap">
              {reportData?.recommendations || "No recommendations available yet."}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
