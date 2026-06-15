import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const { id } = params;

  // Mock data fetching based on ID
  const companyName = id === "1" ? "Acme Corp" : "Sample Company";

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/reports">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-4 h-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold font-heading">{companyName}</h1>
          <p className="text-muted-foreground">Due Diligence Report • Generated on Oct 12, 2026</p>
        </div>
        <div className="ml-auto hidden sm:flex gap-2">
          <Button variant="outline"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          <Button><Download className="w-4 h-4 mr-2" /> Export PDF</Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <Badge variant="default" className="bg-green-600/10 text-green-700 hover:bg-green-600/20">AI Score: 88/100</Badge>
        <Badge variant="secondary">SaaS</Badge>
        <Badge variant="secondary">Series B</Badge>
      </div>

      <Tabs defaultValue="executive" className="w-full">
        <TabsList className="mb-4 bg-secondary/20 flex-wrap h-auto">
          <TabsTrigger value="executive">Executive Summary</TabsTrigger>
          <TabsTrigger value="swot">SWOT Analysis</TabsTrigger>
          <TabsTrigger value="market">Market Analysis</TabsTrigger>
          <TabsTrigger value="risks">Risk Assessment</TabsTrigger>
          <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="executive">
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle>Executive Summary</CardTitle></CardHeader>
            <CardContent className="prose prose-sm md:prose-base dark:prose-invert max-w-none">
              <p>{companyName} demonstrates exceptional unit economics with an LTV/CAC ratio of 4.2x. Market penetration is growing 15% MoM, outpacing primary competitors. The core technology provides a significant moat in the enterprise segment.</p>
              <h3>Key Highlights</h3>
              <ul>
                <li>Strong revenue retention (115% NRR).</li>
                <li>Experienced leadership team with previous successful exits.</li>
                <li>Clear path to profitability within 18 months.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="swot">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="border-border/50 bg-green-50/50 dark:bg-green-900/10">
              <CardHeader><CardTitle className="text-green-700 dark:text-green-400">Strengths</CardTitle></CardHeader>
              <CardContent><ul className="list-disc pl-5"><li>Proprietary algorithm</li><li>High customer loyalty</li></ul></CardContent>
            </Card>
            <Card className="border-border/50 bg-red-50/50 dark:bg-red-900/10">
              <CardHeader><CardTitle className="text-red-700 dark:text-red-400">Weaknesses</CardTitle></CardHeader>
              <CardContent><ul className="list-disc pl-5"><li>High burn rate</li><li>Concentrated customer base</li></ul></CardContent>
            </Card>
            <Card className="border-border/50 bg-blue-50/50 dark:bg-blue-900/10">
              <CardHeader><CardTitle className="text-blue-700 dark:text-blue-400">Opportunities</CardTitle></CardHeader>
              <CardContent><ul className="list-disc pl-5"><li>Expansion into EMEA</li><li>Adjacent product up-sells</li></ul></CardContent>
            </Card>
            <Card className="border-border/50 bg-yellow-50/50 dark:bg-yellow-900/10">
              <CardHeader><CardTitle className="text-yellow-700 dark:text-yellow-400">Threats</CardTitle></CardHeader>
              <CardContent><ul className="list-disc pl-5"><li>Emerging competitors</li><li>Regulatory changes in data privacy</li></ul></CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="market">
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle>Market Analysis</CardTitle></CardHeader>
            <CardContent>
              <p>The Total Addressable Market (TAM) is estimated at $12B, growing at a CAGR of 18%. The company currently captures &lt;1%, indicating massive headroom for growth.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risks">
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle>Risk Assessment</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li><strong className="text-destructive">High:</strong> Customer Concentration. Top 3 customers account for 40% of ARR.</li>
                <li><strong className="text-yellow-600 dark:text-yellow-400">Medium:</strong> Key Person Risk. The CTO holds significant proprietary knowledge undocumented.</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations">
          <Card className="border-border/50 shadow-sm">
            <CardHeader><CardTitle>Final Recommendations</CardTitle></CardHeader>
            <CardContent>
              <p className="font-bold text-lg mb-2 text-green-600">Decision: Proceed with investment.</p>
              <p>Require mitigation plans for customer concentration in the term sheet. Consider allocating funds specifically for expanding the enterprise sales team.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
