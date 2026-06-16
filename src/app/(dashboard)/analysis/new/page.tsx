"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadCloud, Loader2 } from "lucide-react";

export default function NewAnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    websiteUrl: "",
    industry: "",
    targetMarket: "",
    analysisType: "",
    businessDescription: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSelectChange = (field: string, value: string | null) => {
    if (value) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleSubmit = async () => {
    if (!formData.companyName || !formData.analysisType) {
      toast.error("Company Name and Analysis Type are required.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/reports/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to create analysis.");
      }

      toast.success("Analysis started successfully!");
      router.push(`/reports/${data.reportId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

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
              <Label htmlFor="companyName">Startup Name <span className="text-destructive">*</span></Label>
              <Input id="companyName" value={formData.companyName} onChange={handleChange} placeholder="e.g. Acme Corp" disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input id="websiteUrl" value={formData.websiteUrl} onChange={handleChange} type="url" placeholder="https://example.com" disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Select onValueChange={(val: string | null) => handleSelectChange("industry", val)} disabled={loading}>
                <SelectTrigger id="industry">
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SaaS & Enterprise">SaaS & Enterprise</SelectItem>
                  <SelectItem value="Fintech">Fintech</SelectItem>
                  <SelectItem value="Healthtech">Healthtech</SelectItem>
                  <SelectItem value="Consumer">Consumer</SelectItem>
                  <SelectItem value="Deeptech">Deeptech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="targetMarket">Target Market</Label>
              <Input id="targetMarket" value={formData.targetMarket} onChange={handleChange} placeholder="e.g. SMBs, Enterprise, B2C" disabled={loading} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="analysisType">Analysis Type <span className="text-destructive">*</span></Label>
              <Select onValueChange={(val: string | null) => handleSelectChange("analysisType", val)} disabled={loading}>
                <SelectTrigger id="analysisType">
                  <SelectValue placeholder="Select analysis focus" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full Due Diligence">Full Due Diligence</SelectItem>
                  <SelectItem value="Financial Modeling">Financial Modeling</SelectItem>
                  <SelectItem value="Market Landscape">Market Landscape</SelectItem>
                  <SelectItem value="Risk Assessment">Risk Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="businessDescription">Business Description</Label>
              <Textarea id="businessDescription" value={formData.businessDescription} onChange={handleChange} placeholder="Brief overview of what the company does..." className="h-24" disabled={loading} />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Data Room / Document Upload</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-10 flex flex-col items-center justify-center text-center bg-secondary/10 hover:bg-secondary/20 transition-colors cursor-pointer opacity-70">
                <UploadCloud className="w-10 h-10 text-muted-foreground mb-4" />
                <p className="font-medium">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground mt-1">PDFs, Excel, Pitch Decks (Max 50MB) - Coming Soon</p>
              </div>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea id="notes" value={formData.notes} onChange={handleChange} placeholder="Any specific areas the AI should focus on?" disabled={loading} />
            </div>
          </div>
        </CardContent>
        <CardFooter className="bg-secondary/10 border-t border-border/50 py-4 flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Generate Analysis
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
