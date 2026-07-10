import { ICompetitor } from "@/models/CompetitorDiscovery";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutGrid } from "lucide-react";

interface Props {
  competitors: ICompetitor[];
}

export function CompetitorLandscapeQuadrant({ competitors }: Props) {
  // Group competitors by quadrant
  const leaders = competitors.filter(c => c.landscapeQuadrant === "Leader");
  const challengers = competitors.filter(c => c.landscapeQuadrant === "Challenger");
  const visionaries = competitors.filter(c => c.landscapeQuadrant === "Visionary");
  const niche = competitors.filter(c => c.landscapeQuadrant === "Niche Player");

  const QuadrantBox = ({ title, items, colorClass }: { title: string, items: ICompetitor[], colorClass: string }) => (
    <div className={`p-4 border border-border/50 rounded-xl min-h-[160px] ${colorClass}`}>
      <h4 className="font-bold mb-2 text-sm text-muted-foreground uppercase tracking-wider">{title}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <div key={idx} className="px-3 py-1 bg-background rounded-full text-sm font-semibold border shadow-sm">
            {item.name}
          </div>
        ))}
        {items.length === 0 && <span className="text-xs text-muted-foreground italic">None</span>}
      </div>
    </div>
  );

  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><LayoutGrid className="w-5 h-5 text-primary" /> Magic Quadrant</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <QuadrantBox title="Challengers" items={challengers} colorClass="bg-blue-500/5" />
          <QuadrantBox title="Leaders" items={leaders} colorClass="bg-primary/5 border-primary/20" />
          <QuadrantBox title="Niche Players" items={niche} colorClass="bg-secondary/20" />
          <QuadrantBox title="Visionaries" items={visionaries} colorClass="bg-purple-500/5" />
        </div>
      </CardContent>
    </Card>
  );
}
