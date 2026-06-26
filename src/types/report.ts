export type ReportStatus = "completed" | "processing" | "failed";

export type VerdictType = "STRONG_BUY" | "BUY" | "HOLD" | "CAUTION" | "AVOID" | "UNKNOWN";

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

export interface IScoreBreakdownItem {
  score: number;
  reason: string;
}

export interface IScoreBreakdown {
  marketOpportunity: number | IScoreBreakdownItem;
  productStrength: number | IScoreBreakdownItem;
  scalability: number | IScoreBreakdownItem;
  competitiveMoat: number | IScoreBreakdownItem;
  riskLevel: number | IScoreBreakdownItem;
}

export interface IInvestmentVerdict {
  label: string;
  summary: string;
  reasoning?: string;
  strengths?: string[];
  weaknesses?: string[];
  assumptions?: string[];
}

export interface IDataQuality {
  websiteAnalyzed: boolean;
  documentsAnalyzed: number;
  completeness: string;
  missingInfo: string[];
  estimatedReliability: number;
}

export interface ISectionConfidence {
  executiveSummary: number;
  marketAnalysis: number;
  riskAssessment: number;
  competitorAnalysis: number;
  financialHealth: number;
}

export interface ISourceAttribution {
  executiveSummary?: string[];
  marketAnalysis?: string[];
  riskAssessment?: string[];
  keyInsights?: string[];
  swot?: string[];
  competitorAnalysis?: string[];
  growthOpportunities?: string[];
  redFlags?: string[];
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
  dataQuality?: IDataQuality;
  sectionConfidence?: ISectionConfidence;
  sourceAttribution?: ISourceAttribution;
}

export interface IDocumentData {
  fileName: string;
  fileType: string;
  extractedText: string;
}

export interface IAiMetadata {
  modelUsed: string;
  generationTimestamp: Date;
  processingDurationMs: number;
  promptVersion: string;
  overallConfidenceScore: number;
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
  aiMetadata?: IAiMetadata;
  verdict?: VerdictType;
  isSaved?: boolean;
  isArchived?: boolean;
  deletedAt?: Date | null;
  lastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
