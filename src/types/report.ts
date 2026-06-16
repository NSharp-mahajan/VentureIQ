export type ReportStatus = "completed" | "processing" | "failed";

export interface IReportData {
  executiveSummary?: string;
  marketAnalysis?: string;
  competitorAnalysis?: string;
  swot?: string;
  riskAssessment?: string;
  revenueOpportunities?: string;
  recommendations?: string;
}

export interface IReport {
  _id: string;
  userId: string;
  companyName: string;
  industry?: string;
  targetMarket?: string;
  analysisType: string;
  businessDescription?: string;
  websiteUrl?: string;
  notes?: string;
  status: ReportStatus;
  aiScore?: number;
  reportData?: IReportData;
  createdAt: Date;
  updatedAt: Date;
}
