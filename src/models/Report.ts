import mongoose, { Schema, Document } from "mongoose";

export interface IReportDocument extends Document {
  userId: string;
  companyName: string;
  industry?: string;
  targetMarket?: string;
  analysisType: string;
  businessDescription?: string;
  websiteUrl?: string;
  notes?: string;
  status: "completed" | "processing" | "failed";
  aiScore?: number;
  reportData?: {
    executiveSummary?: string;
    marketAnalysis?: string;
    competitorAnalysis?: string;
    swot?: string;
    riskAssessment?: string;
    revenueOpportunities?: string;
    recommendations?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema<IReportDocument>(
  {
    userId: { type: String, required: true, index: true },
    companyName: { type: String, required: true },
    industry: { type: String },
    targetMarket: { type: String },
    analysisType: { type: String, required: true },
    businessDescription: { type: String },
    websiteUrl: { type: String },
    notes: { type: String },
    status: { type: String, enum: ["completed", "processing", "failed"], default: "processing" },
    aiScore: { type: Number },
    reportData: {
      executiveSummary: { type: String },
      marketAnalysis: { type: String },
      competitorAnalysis: { type: String },
      swot: { type: String },
      riskAssessment: { type: String },
      revenueOpportunities: { type: String },
      recommendations: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose overwrite model error during hot reload
export default mongoose.models.Report || mongoose.model<IReportDocument>("Report", ReportSchema);
