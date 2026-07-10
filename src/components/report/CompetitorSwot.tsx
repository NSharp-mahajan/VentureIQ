import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, Sword, Shield, TrendingUp } from "lucide-react";

interface Props {
  swot: {
    companySwot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    headToHeadSwot: Array<{
      competitorName: string;
      sharedStrengths: string[];
      uniqueStrengths: string[];
      sharedRisks: string[];
      competitiveAdvantages: string[];
    }>;
  };
}

export function CompetitorSwot({ swot }: Props) {
  if (!swot || !swot.headToHeadSwot || swot.headToHeadSwot.length === 0) return null;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold flex items-center gap-2">
        <Sword className="w-5 h-5 text-primary" /> Head-to-Head Analysis
      </h3>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {swot.headToHeadSwot.map((h2h, idx) => (
          <Card key={idx} className="border-border/50 shadow-sm">
            <CardHeader className="bg-secondary/5 pb-4 border-b border-border/50">
              <CardTitle className="text-lg">vs {h2h.competitorName}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="grid grid-cols-2 divide-x divide-border/50">
                {/* Left Column: Strengths / Advantages */}
                <div className="p-4 space-y-4">
                  <div>
                    <h5 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" /> Our Advantage
                    </h5>
                    <ul className="space-y-1">
                      {h2h.competitiveAdvantages?.map((adv, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {adv}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Target className="w-3 h-3" /> Shared Strengths
                    </h5>
                    <ul className="space-y-1">
                      {h2h.sharedStrengths?.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Right Column: Threats / Unique competitor strengths */}
                <div className="p-4 space-y-4 bg-secondary/5">
                  <div>
                    <h5 className="text-xs font-bold text-red-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Competitor Edge
                    </h5>
                    <ul className="space-y-1">
                      {h2h.uniqueStrengths?.map((s, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-orange-600 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Shield className="w-3 h-3" /> Shared Risks
                    </h5>
                    <ul className="space-y-1">
                      {h2h.sharedRisks?.map((r, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {r}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
