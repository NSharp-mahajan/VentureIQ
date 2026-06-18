export type ReportStatus = "completed" | "processing" | "failed";

export interface ISwot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface IReportData {
  executiveSummary?: string;
  marketAnalysis?: string;
  riskAssessment?: string;
  swot?: ISwot;
  investmentScore?: number;
  recommendation?: string;
  keyInsights?: string[];
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
  errorMessage?: string;
  aiScore?: number;
  reportData?: IReportData;
  createdAt: Date;
  updatedAt: Date;
}
