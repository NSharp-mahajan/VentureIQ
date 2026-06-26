import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 min-h-[400px] border border-dashed border-border/60 rounded-xl bg-card/50", className)}>
      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-secondary/40 text-muted-foreground mb-4">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground font-heading">{title}</h3>
      <p className="text-muted-foreground max-w-sm mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  );
}
