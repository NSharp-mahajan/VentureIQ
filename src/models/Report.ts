import mongoose, { Schema, Document } from "mongoose";

export interface IReportDocument extends Document {
  userId: string;
  companyName: string;
  industry?: string;
  targetMarket?: string;
  analysisType: string;
  businessDescription?: string;
  websiteUrl?: string;
  documents?: {
    fileName: string;
    fileType: string;
    extractedText: string;
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
    documents: [
      {
        fileName: { type: String },
        fileType: { type: String },
        extractedText: { type: String },
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
    },
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
