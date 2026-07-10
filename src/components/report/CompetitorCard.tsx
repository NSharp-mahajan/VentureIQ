import { useState } from "react";
import { ICompetitor } from "@/models/CompetitorDiscovery";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Props {
  competitor: ICompetitor;
}

export function CompetitorCard({ competitor }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("companyName", competitor.name);
      formData.append("industry", competitor.industry || "Unknown");
      formData.append("analysisType", "Full Due Diligence");
      formData.append("businessDescription", competitor.oneLineDescription || "");

      const res = await fetch("/api/reports/create", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      
      if (res.ok && data.reportId) {
        toast.success("Created report for competitor!");
        router.push(`/reports/${data.reportId}`);
      } else {
        toast.error(data.error || "Failed to create report");
      }
    } catch (err) {
      console.error(err);
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="flex flex-col h-full border-border/50 shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{competitor.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{competitor.industry} • {competitor.estimatedSize}</p>
          </div>
          <Badge variant="secondary">{competitor.type}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm font-medium">{competitor.oneLineDescription}</p>
        
        <div className="space-y-2 pt-2 border-t border-border/50">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Overall Similarity</span>
            <span className="font-bold">{competitor.similarityScore}%</span>
          </div>
          <Progress value={competitor.similarityScore} className="h-1.5" />
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Market</span>
              <span>{competitor.similarity?.marketOverlap || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span>Tech</span>
              <span>{competitor.similarity?.technologyOverlap || 0}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-1 pt-2">
          <p className="text-xs font-semibold">Competitive Moat</p>
          <p className="text-xs text-muted-foreground">{competitor.comparison?.competitiveMoat || "N/A"}</p>
        </div>
      </CardContent>
      <CardFooter className="bg-secondary/10 pt-4 rounded-b-xl border-t border-border/50">
        <Button onClick={handleAnalyze} disabled={loading} className="w-full" variant="outline">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <ArrowRight className="w-4 h-4 mr-2" />}
          {loading ? "Generating..." : "Analyze This Competitor"}
        </Button>
      </CardFooter>
    </Card>
  );
}
