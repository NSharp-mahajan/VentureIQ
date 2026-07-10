import { ICompetitor } from "@/models/CompetitorDiscovery";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table as TableIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface Props {
  competitors: ICompetitor[];
}

export function CompetitorMatrix({ competitors }: Props) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><TableIcon className="w-5 h-5 text-primary" /> Competitive Matrix</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Company</TableHead>
              <TableHead>Investment Score</TableHead>
              <TableHead>Market Position</TableHead>
              <TableHead>Innovation</TableHead>
              <TableHead>Moat</TableHead>
              <TableHead>Risk</TableHead>
              <TableHead>Verdict</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {competitors.map((c, i) => (
              <TableRow key={i}>
                <TableCell className="font-medium">{c.name}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={c.matrix?.investmentScore || 0} className="w-16 h-2" />
                    <span className="text-xs">{c.matrix?.investmentScore || 0}%</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={c.matrix?.marketPosition || 0} className="w-16 h-2 [&>div]:bg-blue-500" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={c.matrix?.innovation || 0} className="w-16 h-2 [&>div]:bg-purple-500" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={c.matrix?.moat || 0} className="w-16 h-2 [&>div]:bg-green-500" />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Progress value={c.matrix?.risk || 0} className="w-16 h-2 [&>div]:bg-red-500" />
                  </div>
                </TableCell>
                <TableCell className="text-sm font-medium">{c.matrix?.overallVerdict || "Hold"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
