import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactNode } from "react";
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  isNumeric?: boolean;
}

export function StatCard({ title, value, icon, trend, isNumeric = false }: StatCardProps) {
  return (
    <Card className="border-border/50 shadow-sm bg-background/50 backdrop-blur-sm transition-colors hover:bg-background overflow-hidden relative group">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="text-muted-foreground p-2 rounded-full bg-secondary/30">
          {icon}
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className="text-2xl font-bold tracking-tight">
          {isNumeric && typeof value === "number" ? <AnimatedCounter value={value} /> : value}
        </div>
        {trend && (
          <p className={cn("text-xs mt-1", trend.isPositive ? "text-emerald-500" : "text-red-500")}>
            {trend.isPositive ? "↑" : "↓"} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
