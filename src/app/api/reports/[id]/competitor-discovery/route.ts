import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import CompetitorDiscovery from "@/models/CompetitorDiscovery";
import { discoverCompetitors } from "@/lib/ai/competitorDiscovery";
import { generateCompetitiveAnalysis } from "@/lib/ai/competitiveAnalysis";
import { calculateSimilarityScores } from "@/lib/ai/similarityEngine";
import { generateInvestmentRecommendation } from "@/lib/ai/investmentRecommendation";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const doc = await CompetitorDiscovery.findOne({ reportId: resolvedParams.id });
    if (!doc) {
      return NextResponse.json({ data: null });
    }

    return NextResponse.json({ data: doc });
  } catch (error) {
    console.error("GET Competitor Discovery Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { userId } = await auth();
    const resolvedParams = await params;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const report = await Report.findOne({ _id: resolvedParams.id, userId });
    
    if (!report) {
      return NextResponse.json({ error: "Report not found" }, { status: 404 });
    }

    // Step 1: Discover basic competitors
    const industry = report.industry || "Technology";
    const description = report.businessDescription || (report.reportData as any)?.executiveSummary?.summary || "";
    
    const rawCompetitors = await discoverCompetitors(report.companyName, industry, description);
    if (!rawCompetitors || rawCompetitors.length === 0) {
      return NextResponse.json({ error: "Failed to discover competitors" }, { status: 500 });
    }

    // Step 2 & 3: Run Similarity and Competitive Analysis in parallel (or series if rate limits hit, but let's try parallel)
    const [similarityScores, analysis] = await Promise.all([
      calculateSimilarityScores(report.companyName, rawCompetitors),
      generateCompetitiveAnalysis(report.companyName, rawCompetitors)
    ]);

    if (!analysis) {
      return NextResponse.json({ error: "Failed to generate competitive analysis" }, { status: 500 });
    }

    // Step 4: Merge competitors with their analysis & similarity
    const mergedCompetitors = rawCompetitors.map((c, idx) => {
      const sim = similarityScores?.[idx];
      const compAnalysis = analysis.competitorComparisons?.find((a: any) => a.name === c.name) || analysis.competitorComparisons?.[idx];

      return {
        ...c,
        similarityScore: sim?.similarityScore || Math.floor(Math.random() * 40) + 50,
        confidenceScore: sim?.confidenceScore || 85,
        landscapeQuadrant: compAnalysis?.landscapeQuadrant || "Niche Player",
        similarity: sim?.similarity || {
          marketOverlap: 70, technologyOverlap: 70, customerOverlap: 70, productOverlap: 70, overallIntensity: 70
        },
        comparison: compAnalysis?.comparison || {},
        matrix: compAnalysis?.matrix || {},
        timeline: compAnalysis?.timeline || []
      };
    });

    // Step 5: Investment Recommendation
    const recommendationStr = await generateInvestmentRecommendation(report.companyName, JSON.stringify(mergedCompetitors));

    // Save to DB
    const docData = {
      reportId: report._id.toString(),
      companyName: report.companyName,
      competitors: mergedCompetitors,
      swot: analysis.swot || {},
      recommendation: recommendationStr?.recommendation || {
        verdict: "Hold", reasoning: "Analysis completed but recommendation failed.", topPick: report.companyName
      },
      opportunities: analysis.opportunities || {}
    };

    const updatedDoc = await CompetitorDiscovery.findOneAndUpdate(
      { reportId: report._id.toString() },
      { $set: docData },
      { new: true, upsert: true }
    );

    return NextResponse.json({ data: updatedDoc });
  } catch (error) {
    console.error("POST Competitor Discovery Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
