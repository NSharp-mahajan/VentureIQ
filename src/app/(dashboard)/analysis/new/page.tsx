import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud } from "lucide-react";

export default function NewAnalysisPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold font-heading">New Analysis</h1>
        <p className="text-muted-foreground">Submit a new company for AI-powered due diligence.</p>
      </div>

      <Card className="max-w-4xl border-border/50 shadow-sm">
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>Provide basic information about the target company.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="startup-name">Startup Name</Label>
              <Input id="startup-name" placeholder="e.g. Acme Corp" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website URL</Label>
              <Input id="website" type="url" placeholder="https://example.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="saas">SaaS & Enterprise</SelectItem>
                  <SelectItem value="fintech">Fintech</SelectItem>
                  <SelectItem value="healthtech">Healthtech</SelectItem>
                  <SelectItem value="consumer">Consumer</SelectItem>
                  <SelectItem value="deeptech">Deeptech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-market">Target Market</Label>
              <Input id="target-market" placeholder="e.g. SMBs, Enterprise, B2C" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="analysis-type">Analysis Type</Label>
              <Select>
                <SelectTrigger id="analysis-type">
                  <SelectValue placeholder="Select analysis focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Due Diligence</SelectItem>
                  <SelectItem value="financial">Financial Modeling</SelectItem>
                  <SelectItem value="market">Market Landscape</SelectItem>
                  <SelectItem value="risk">Risk Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="description">Business Description</Label>
              <Textarea id="description" placeholder="Brief overview of what the company does..." className="h-24" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Data Room / Document Upload</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer">
                <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground mt-1">PDFs, Excel, Pitch Decks (Max 50MB)</p>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" placeholder="Any specific areas the AI should focus on?" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-secondary/10 border-t border-border/50 py-4 flex justify-end gap-4">
          <Button variant="outline">Save Draft</Button>
          <Button>Generate Analysis</Button>
        </CardFooter>
      </Card>
    </div>
  );
}
