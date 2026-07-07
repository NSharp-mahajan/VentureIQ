import mongoose, { Document, Model, Schema } from "mongoose";

export interface IMarketNewsCache extends Document {
  articleUrl: string;
  title: string;
  description: string;
  source: string;
  publishedAt: Date;
  imageUrl?: string;
  
  // AI Generated Fields
  aiSummary: string;
  investorTakeaways: string[];
  marketImpact: string;
  sentiment: "Bullish" | "Neutral" | "Bearish";
  confidenceScore: number;
  category: string;
  
  createdAt: Date;
}

const MarketNewsCacheSchema = new Schema<IMarketNewsCache>(
  {
    articleUrl: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    source: { type: String, required: true },
    publishedAt: { type: Date, required: true },
    imageUrl: { type: String },
    
    aiSummary: { type: String, required: true },
    investorTakeaways: [{ type: String }],
    marketImpact: { type: String, required: true },
    sentiment: { type: String, enum: ["Bullish", "Neutral", "Bearish"], required: true },
    confidenceScore: { type: Number, required: true },
    category: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const MarketNewsCache: Model<IMarketNewsCache> =
  mongoose.models.MarketNewsCache || mongoose.model<IMarketNewsCache>("MarketNewsCache", MarketNewsCacheSchema);

export default MarketNewsCache;
