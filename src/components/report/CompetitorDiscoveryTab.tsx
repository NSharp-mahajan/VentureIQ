"use client";

import { useState, useEffect } from "react";
import { Loader2, RefreshCw, Trophy, LineChart, Shield, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CompetitorLandscapeQuadrant } from "./CompetitorLandscapeQuadrant";
import { CompetitorMatrix } from "./CompetitorMatrix";
import { CompetitorCard } from "./CompetitorCard";
import { CompetitorSwot } from "./CompetitorSwot";

interface CompetitorDiscoveryTabProps {
  reportId: string;
}

export function CompetitorDiscoveryTab({ reportId }: CompetitorDiscoveryTabProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const fetchDiscovery = async () => {
    try {
      const res = await fetch(`/api/reports/${reportId}/competitor-discovery`);
      const json = await res.json();
      if (json.data) {
        setData(json.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscovery();
  }, [reportId]);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch(`/api/reports/${reportId}/competitor-discovery`, {
        method: "POST"
      });
      const json = await res.json();
      if (json.error) {
        toast.error(json.error);
      } else {
        setData(json.data);
        toast.success("Competitor analysis completed successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate competitor discovery.");
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading competitor intelligence...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="flex flex-col items-center justify-center h-96 text-center space-y-4">
          <Trophy className="w-16 h-16 text-muted-foreground/30" />
          <h3 className="text-xl font-bold">No Competitor Discovery Found</h3>
          <p className="text-muted-foreground max-w-md">
            Our AI can automatically identify competitors, generate magic quadrants, similarity scores, and deep SWOT analyses.
          </p>
          <Button onClick={handleGenerate} disabled={generating} className="mt-4">
            {generating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing Ecosystem...</> : <><RefreshCw className="w-4 h-4 mr-2" /> Generate Discovery</>}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-secondary/10 p-4 rounded-xl border border-border/50">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6 text-primary" /> Competitive Ecosystem
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Generated on {new Date(data.updatedAt).toLocaleDateString()}</p>
        </div>
        <Button onClick={handleGenerate} disabled={generating} variant="outline" size="sm">
          {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          {generating ? "Refreshing..." : "Refresh Analysis"}
        </Button>
      </div>

      {/* Top Section: Quadrant & Recommendation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CompetitorLandscapeQuadrant competitors={data.competitors} />
        </div>
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5 shadow-sm h-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                <LineChart className="w-5 h-5" /> Investment Verdict
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-background rounded-lg border border-border/50">
                <p className="text-sm font-semibold text-muted-foreground mb-1">Final Recommendation</p>
                <p className="text-2xl font-bold">{data.recommendation.verdict}</p>
              </div>
              <div className="p-4 bg-background rounded-lg border border-border/50">
                <p className="text-sm font-semibold text-muted-foreground mb-1">Category Top Pick</p>
                <p className="text-lg font-bold text-primary">{data.recommendation.topPick}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Rationale</p>
                <p className="text-sm text-foreground leading-relaxed">
                  {data.recommendation.reasoning}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Opportunities & Threats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-green-500/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Zap className="w-5 h-5" /> AI Discovered Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.opportunities.marketGaps?.map((gap: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-green-500">•</span> {gap}
                </li>
              ))}
              {data.opportunities.expansionOpportunities?.map((gap: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-green-500">•</span> {gap}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-red-500/20 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <Shield className="w-5 h-5" /> Competitive Threats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {data.opportunities.threats?.map((threat: string, i: number) => (
                <li key={i} className="flex gap-2 text-sm">
                  <span className="text-red-500">•</span> {threat}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Matrix View */}
      <CompetitorMatrix competitors={data.competitors} />

      {/* Deep Dive Cards */}
      <div>
        <h3 className="text-xl font-bold mb-6">Competitor Deep Dives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.competitors.map((comp: any, idx: number) => (
            <CompetitorCard key={idx} competitor={comp} />
          ))}
        </div>
      </div>

      {/* SWOT Comparison */}
      <CompetitorSwot swot={data.swot} />
    </div>
  );
}
