import mongoose, { Schema, Document } from "mongoose";

export interface IReportDocument extends Document {
  userId: string;
  workspaceId?: mongoose.Types.ObjectId | string;
  companyName: string;
  industry?: string;
  targetMarket?: string;
  analysisType: string;
  businessDescription?: string;
  websiteUrl?: string;
  documents?: {
    fileName: string;
    fileType: string;
    sizeBytes?: number;
    uploadTimestamp?: Date;
    extractedText: string;
    analysis?: {
      executiveSummary?: string;
      keyBusinessHighlights?: string[];
      financialMentions?: string[];
      productInformation?: string;
      risks?: string[];
      teamInformation?: string;
      marketInformation?: string;
      missingInformation?: string[];
    };
    metadata?: {
      pageCount?: number;
      wordCount?: number;
      processingDurationMs?: number;
      extractionSuccess?: boolean;
      extractionConfidence?: number;
    };
  }[];
  scrapedData?: {
    title: string;
    description: string;
    content: string;
  };
  notes?: string;
  status: "completed" | "processing" | "failed";
  errorMessage?: string;
  aiScore?: number;
    reportData?: {
      executiveSummary?: string;
      marketAnalysis?: string;
      riskAssessment?: string;
      swot?: {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
      };
      investmentScore?: number;
      recommendation?: string;
      keyInsights?: string[];
      competitorAnalysis?: {
        topCompetitors: {
          name: string;
          reason: string;
          differentiation: string;
        }[];
        summary: string;
      };
      redFlags?: {
        title: string;
        severity: string;
        description: string;
      }[];
      growthOpportunities?: {
        title: string;
        description: string;
        timeframe: string;
      }[];
      scoreBreakdown?: {
        marketOpportunity: number | { score: number, reason: string };
        productStrength: number | { score: number, reason: string };
        scalability: number | { score: number, reason: string };
        competitiveMoat: number | { score: number, reason: string };
        riskLevel: number | { score: number, reason: string };
      };
      investmentVerdict?: {
        label: string;
        summary: string;
        reasoning?: string;
        strengths?: string[];
        weaknesses?: string[];
        assumptions?: string[];
      };
      dataQuality?: {
        websiteAnalyzed: boolean;
        documentsAnalyzed: number;
        completeness: string;
        missingInfo: string[];
        estimatedReliability: number;
      };
      sectionConfidence?: {
        executiveSummary: number;
        marketAnalysis: number;
        riskAssessment: number;
        competitorAnalysis: number;
        financialHealth: number;
      };
      sourceAttribution?: {
        executiveSummary?: string[];
        marketAnalysis?: string[];
        riskAssessment?: string[];
        keyInsights?: string[];
        swot?: string[];
        competitorAnalysis?: string[];
        growthOpportunities?: string[];
        redFlags?: string[];
      };
    };
  aiMetadata?: {
    modelUsed: string;
    generationTimestamp: Date;
    processingDurationMs: number;
    promptVersion: string;
    overallConfidenceScore: number;
  };
  verdict?: string;
  isSaved?: boolean;
  isArchived?: boolean;
  deletedAt?: Date | null;
  lastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    userId: { type: String, required: true, index: true },
    workspaceId: { type: Schema.Types.ObjectId, ref: "Workspace", index: true },
    companyName: { type: String, required: true },
    industry: { type: String },
    targetMarket: { type: String },
    analysisType: { type: String, required: true },
    businessDescription: { type: String },
    websiteUrl: { type: String },
    documents: [
      {
        fileName: { type: String },
        fileType: { type: String },
        sizeBytes: { type: Number },
        uploadTimestamp: { type: Date },
        extractedText: { type: String },
        analysis: { type: Schema.Types.Mixed },
        metadata: { type: Schema.Types.Mixed },
      },
    ],
    scrapedData: {
      title: { type: String },
      description: { type: String },
      content: { type: String },
    },
    notes: { type: String },
    status: { type: String, enum: ["completed", "processing", "failed"], default: "processing" },
    errorMessage: { type: String },
    aiScore: { type: Number },
      reportData: {
        executiveSummary: { type: String },
        marketAnalysis: { type: String },
        riskAssessment: { type: String },
        swot: {
          strengths: [{ type: String }],
          weaknesses: [{ type: String }],
          opportunities: [{ type: String }],
          threats: [{ type: String }],
        },
        investmentScore: { type: Number },
        recommendation: { type: String },
        keyInsights: [{ type: String }],
        competitorAnalysis: {
          topCompetitors: [
            {
              name: { type: String },
              reason: { type: String },
              differentiation: { type: String },
            }
          ],
          summary: { type: String }
        },
        redFlags: [
          {
            title: { type: String },
            severity: { type: String },
            description: { type: String },
          }
        ],
        growthOpportunities: [
          {
            title: { type: String },
            description: { type: String },
            timeframe: { type: String },
          }
        ],
        scoreBreakdown: {
          marketOpportunity: { type: Schema.Types.Mixed },
          productStrength: { type: Schema.Types.Mixed },
          scalability: { type: Schema.Types.Mixed },
          competitiveMoat: { type: Schema.Types.Mixed },
          riskLevel: { type: Schema.Types.Mixed },
        },
        investmentVerdict: {
          label: { type: String },
          summary: { type: String },
          reasoning: { type: String },
          strengths: [{ type: String }],
          weaknesses: [{ type: String }],
          assumptions: [{ type: String }],
        },
        dataQuality: {
          websiteAnalyzed: { type: Boolean },
          documentsAnalyzed: { type: Number },
          completeness: { type: String },
          missingInfo: [{ type: String }],
          estimatedReliability: { type: Number },
        },
        sectionConfidence: {
          executiveSummary: { type: Number },
          marketAnalysis: { type: Number },
          riskAssessment: { type: Number },
          competitorAnalysis: { type: Number },
          financialHealth: { type: Number },
        },
        sourceAttribution: { type: Schema.Types.Mixed },
      },
    aiMetadata: {
      modelUsed: { type: String },
      generationTimestamp: { type: Date },
      processingDurationMs: { type: Number },
      promptVersion: { type: String },
      overallConfidenceScore: { type: Number },
    },
    verdict: { 
      type: String, 
      enum: ["STRONG_BUY", "BUY", "HOLD", "CAUTION", "AVOID", "UNKNOWN"], 
      default: "UNKNOWN" 
    },
    isSaved: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    lastViewedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Force mongoose to reload schema during hot reload
if (mongoose.models.Report) {
  delete mongoose.models.Report;
}
export default mongoose.model<IReportDocument>("Report", ReportSchema);
