"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer, Tooltip } from "recharts";
import { IScoreBreakdown } from "@/types/report";

interface ScoreBreakdownChartProps {
  scoreBreakdown?: IScoreBreakdown;
}

export function ScoreBreakdownChart({ scoreBreakdown }: ScoreBreakdownChartProps) {
  if (!scoreBreakdown) {
    return (
      <div className="flex items-center justify-center h-full min-h-[250px] bg-secondary/5 border border-border/50 rounded-lg">
        <p className="text-sm text-muted-foreground">Score breakdown not available for this report.</p>
      </div>
    );
  }

  const data = [
    { subject: "Market Opportunity", score: scoreBreakdown.marketOpportunity, fullMark: 100 },
    { subject: "Product Strength", score: scoreBreakdown.productStrength, fullMark: 100 },
    { subject: "Scalability", score: scoreBreakdown.scalability, fullMark: 100 },
    { subject: "Competitive Moat", score: scoreBreakdown.competitiveMoat, fullMark: 100 },
    { subject: "Risk Level", score: scoreBreakdown.riskLevel, fullMark: 100 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "currentColor", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
            itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
          />
          <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
