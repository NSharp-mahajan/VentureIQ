"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BrainCircuit, LayoutDashboard, PlusCircle, FileText, GitCompare, Settings, Users } from "lucide-react";

const routes = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "New Analysis", icon: PlusCircle, href: "/analysis/new" },
  { label: "Reports", icon: FileText, href: "/reports" },
  { label: "Workspaces", icon: Users, href: "/workspaces" },
  { label: "Compare Companies", icon: GitCompare, href: "/compare" },
  { label: "Settings", icon: Settings, href: "/settings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full bg-secondary/10 border-r border-border/50 px-4 py-6">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 mb-10">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
          <BrainCircuit className="text-primary-foreground w-5 h-5" />
        </div>
        <span className="text-xl font-bold font-heading tracking-tight text-foreground">
          Venture<span className="text-primary">IQ</span>
        </span>
      </Link>
      
      <div className="space-y-1.5 flex-1">
        {routes.map((route) => {
          const isActive = pathname === route.href || (pathname.startsWith(route.href) && route.href !== '/dashboard');
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <route.icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
              {route.label}
            </Link>
          )
        })}
      </div>
    </div>
  );
}
