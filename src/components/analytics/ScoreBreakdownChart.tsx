/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
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

  const getScore = (val: any) => typeof val === 'number' ? val : (val?.score || 0);

  const data = [
    { subject: "Market Opportunity", score: getScore(scoreBreakdown.marketOpportunity), fullMark: 100 },
    { subject: "Product Strength", score: getScore(scoreBreakdown.productStrength), fullMark: 100 },
    { subject: "Scalability", score: getScore(scoreBreakdown.scalability), fullMark: 100 },
    { subject: "Competitive Moat", score: getScore(scoreBreakdown.competitiveMoat), fullMark: 100 },
    { subject: "Risk Level", score: getScore(scoreBreakdown.riskLevel), fullMark: 100 },
  ];

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <defs>
            <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <PolarGrid stroke="hsl(var(--border))" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: 'hsl(var(--primary))', fontWeight: 'bold' }}
          />
          <Radar 
            name="Score" 
            dataKey="score" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            fill="url(#radarGradient)" 
            fillOpacity={1} 
            animationDuration={1200}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
