"use client";

import { useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { ReportPDF } from "./ReportPDF";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { IReport } from "@/types/report";
import { toast } from "sonner";

export const ExportPDFButton = ({ report }: { report: IReport }) => {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    try {
      setLoading(true);
      
      // Generate the PDF blob purely on-demand
      const blob = await pdf(<ReportPDF report={report} />).toBlob();
      const url = URL.createObjectURL(blob);
      
      // Programmatically trigger a download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${report.companyName.replace(/\s+/g, '_')}_Due_Diligence.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up the URL object to free memory
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
      toast.error("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleExport} 
      disabled={loading} 
      className="flex-1 sm:flex-none w-full sm:w-auto"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </>
      )}
    </Button>
  );
};

export default ExportPDFButton;
