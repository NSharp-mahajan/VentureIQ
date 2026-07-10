import mongoose, { Schema, Document } from "mongoose";

export interface ICompetitor {
  name: string;
  industry: string;
  headquarters: string;
  foundedYear: string;
  estimatedSize: string;
  oneLineDescription: string;
  whyCompetitor: string;
  differentiation: string;
  similarityScore: number;
  confidenceScore: number;
  type: "Direct" | "Indirect" | "Emerging" | "Leader";
  landscapeQuadrant: "Leader" | "Challenger" | "Visionary" | "Niche Player";
  similarity: {
    marketOverlap: number;
    technologyOverlap: number;
    customerOverlap: number;
    productOverlap: number;
    overallIntensity: number;
  };
  comparison: {
    businessModel: string;
    targetCustomers: string;
    revenueStrategy: string;
    coreProducts: string;
    technology: string;
    goToMarket: string;
    pricing: string;
    distribution: string;
    strengths: string[];
    weaknesses: string[];
    competitiveMoat: string;
    marketOpportunity: string;
    scalability: string;
    risk: string;
    innovation: string;
    investmentPotential: string;
  };
  matrix: {
    investmentScore: number;
    marketPosition: number;
    innovation: number;
    growth: number;
    risk: number;
    moat: number;
    funding: number;
    overallVerdict: string;
  };
  timeline: Array<{
    date: string;
    event: string;
    type: "Founded" | "Funding" | "Product" | "Acquisition" | "Milestone";
  }>;
}

export interface ICompetitorDiscovery extends Document {
  reportId: string;
  companyName: string;
  competitors: ICompetitor[];
  swot: {
    companySwot: {
      strengths: string[];
      weaknesses: string[];
      opportunities: string[];
      threats: string[];
    };
    headToHeadSwot: Array<{
      competitorName: string;
      sharedStrengths: string[];
      uniqueStrengths: string[];
      sharedRisks: string[];
      competitiveAdvantages: string[];
    }>;
  };
  recommendation: {
    verdict: string;
    reasoning: string;
    topPick: string;
  };
  opportunities: {
    marketGaps: string[];
    expansionOpportunities: string[];
    potentialAcquisitions: string[];
    potentialPartnerships: string[];
    threats: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

const CompetitorSchema = new Schema<ICompetitor>({
  name: { type: String, required: true },
  industry: { type: String, required: true },
  headquarters: { type: String },
  foundedYear: { type: String },
  estimatedSize: { type: String },
  oneLineDescription: { type: String },
  whyCompetitor: { type: String },
  differentiation: { type: String },
  similarityScore: { type: Number, required: true },
  confidenceScore: { type: Number, required: true },
  type: { type: String, enum: ["Direct", "Indirect", "Emerging", "Leader"], required: true },
  landscapeQuadrant: { type: String, enum: ["Leader", "Challenger", "Visionary", "Niche Player"], required: true },
  similarity: {
    marketOverlap: { type: Number },
    technologyOverlap: { type: Number },
    customerOverlap: { type: Number },
    productOverlap: { type: Number },
    overallIntensity: { type: Number },
  },
  comparison: {
    businessModel: { type: String },
    targetCustomers: { type: String },
    revenueStrategy: { type: String },
    coreProducts: { type: String },
    technology: { type: String },
    goToMarket: { type: String },
    pricing: { type: String },
    distribution: { type: String },
    strengths: [{ type: String }],
    weaknesses: [{ type: String }],
    competitiveMoat: { type: String },
    marketOpportunity: { type: String },
    scalability: { type: String },
    risk: { type: String },
    innovation: { type: String },
    investmentPotential: { type: String },
  },
  matrix: {
    investmentScore: { type: Number },
    marketPosition: { type: Number },
    innovation: { type: Number },
    growth: { type: Number },
    risk: { type: Number },
    moat: { type: Number },
    funding: { type: Number },
    overallVerdict: { type: String },
  },
  timeline: [{
    date: { type: String },
    event: { type: String },
    type: { type: String, enum: ["Founded", "Funding", "Product", "Acquisition", "Milestone"] },
  }],
});

const CompetitorDiscoverySchema = new Schema<ICompetitorDiscovery>({
  reportId: { type: String, required: true, unique: true, index: true },
  companyName: { type: String, required: true },
  competitors: [CompetitorSchema],
  swot: {
    companySwot: {
      strengths: [{ type: String }],
      weaknesses: [{ type: String }],
      opportunities: [{ type: String }],
      threats: [{ type: String }],
    },
    headToHeadSwot: [{
      competitorName: { type: String },
      sharedStrengths: [{ type: String }],
      uniqueStrengths: [{ type: String }],
      sharedRisks: [{ type: String }],
      competitiveAdvantages: [{ type: String }],
    }],
  },
  recommendation: {
    verdict: { type: String },
    reasoning: { type: String },
    topPick: { type: String },
  },
  opportunities: {
    marketGaps: [{ type: String }],
    expansionOpportunities: [{ type: String }],
    potentialAcquisitions: [{ type: String }],
    potentialPartnerships: [{ type: String }],
    threats: [{ type: String }],
  },
}, {
  timestamps: true,
});

export default mongoose.models.CompetitorDiscovery || mongoose.model<ICompetitorDiscovery>("CompetitorDiscovery", CompetitorDiscoverySchema);
