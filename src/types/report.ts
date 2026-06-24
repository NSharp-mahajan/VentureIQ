export type ReportStatus = "completed" | "processing" | "failed";

export interface ISwot {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export interface ICompetitor {
  name: string;
  reason: string;
  differentiation: string;
}

export interface ICompetitorAnalysis {
  topCompetitors: ICompetitor[];
  summary: string;
}

export interface IRedFlag {
  title: string;
  severity: "low" | "medium" | "high";
  description: string;
}

export interface IGrowthOpportunity {
  title: string;
  description: string;
  timeframe: "short-term" | "mid-term" | "long-term";
}

export interface IScoreBreakdown {
  marketOpportunity: number;
  productStrength: number;
  scalability: number;
  competitiveMoat: number;
  riskLevel: number;
}

export interface IInvestmentVerdict {
  label: string;
  summary: string;
}

export interface IReportData {
  executiveSummary?: string;
  marketAnalysis?: string;
  riskAssessment?: string;
  swot?: ISwot;
  investmentScore?: number;
  recommendation?: string;
  keyInsights?: string[];
  competitorAnalysis?: ICompetitorAnalysis;
  redFlags?: IRedFlag[];
  growthOpportunities?: IGrowthOpportunity[];
  scoreBreakdown?: IScoreBreakdown;
  investmentVerdict?: IInvestmentVerdict;
}

export interface IDocumentData {
  fileName: string;
  fileType: string;
  extractedText: string;
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
  documents?: IDocumentData[];
  scrapedData?: {
    title: string;
    description: string;
    content: string;
  };
  notes?: string;
  status: ReportStatus;
  errorMessage?: string;
  aiScore?: number;
  reportData?: IReportData;
  createdAt: Date;
  updatedAt: Date;
}
