"use client";

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

interface ScoreTrendChartProps {
  data: {
    name: string;
    score: number;
  }[];
}

export function ScoreTrendChart({ data }: ScoreTrendChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] bg-secondary/5 border border-border/50 rounded-lg">
        <p className="text-sm text-muted-foreground">Not enough data for chart.</p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => value.length > 10 ? `${value.substring(0, 10)}...` : value}
          />
          <YAxis 
            tick={{ fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
          />
          <Tooltip 
            cursor={{ fill: 'hsl(var(--secondary))', opacity: 0.2 }}
            contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
          />
          <Bar dataKey="score" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
