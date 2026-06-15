import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Filter } from "lucide-react";
import Link from "next/link";

const MOCK_REPORTS = [
  { id: "1", name: "Acme Corp", industry: "SaaS", type: "Full Diligence", score: "88/100", date: "Oct 12, 2026" },
  { id: "2", name: "Nexus Tech", industry: "Deeptech", type: "Market Analysis", score: "72/100", date: "Oct 10, 2026" },
  { id: "3", name: "FinFlow", industry: "Fintech", type: "Risk Assessment", score: "94/100", date: "Sep 28, 2026" },
  { id: "4", name: "HealthSync", industry: "Healthtech", type: "Full Diligence", score: "65/100", date: "Sep 15, 2026" },
  { id: "5", name: "EcoLogistics", industry: "Supply Chain", type: "Financial", score: "81/100", date: "Sep 02, 2026" },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading">Reports Library</h1>
          <p className="text-muted-foreground">Access and manage all your generated due diligence reports.</p>
        </div>
        <Link href="/analysis/new">
          <Button>New Analysis</Button>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card p-4 rounded-lg border border-border/50 shadow-sm">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search companies or industries..." className="pl-9 w-full" />
        </div>
        <Button variant="outline" className="w-full sm:w-auto gap-2">
          <Filter className="w-4 h-4" />
          Filters
        </Button>
      </div>

      <div className="border border-border/50 rounded-lg bg-card overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-secondary/30">
            <TableRow>
              <TableHead>Company Name</TableHead>
              <TableHead>Industry</TableHead>
              <TableHead>Analysis Type</TableHead>
              <TableHead>AI Score</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MOCK_REPORTS.map((report) => (
              <TableRow key={report.id} className="hover:bg-secondary/10">
                <TableCell className="font-medium">{report.name}</TableCell>
                <TableCell><Badge variant="secondary">{report.industry}</Badge></TableCell>
                <TableCell>{report.type}</TableCell>
                <TableCell>
                  <span className={`font-semibold ${parseInt(report.score) > 80 ? 'text-green-600' : parseInt(report.score) > 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {report.score}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{report.date}</TableCell>
                <TableCell className="text-right">
                  <Link href={`/reports/${report.id}`}>
                    <Button variant="ghost" size="sm">View</Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
