import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      companyName,
      industry,
      targetMarket,
      analysisType,
      businessDescription,
      websiteUrl,
      notes,
    } = body;

    if (!companyName || !analysisType) {
      return NextResponse.json(
        { error: "Company Name and Analysis Type are required." },
        { status: 400 }
      );
    }

    await connectDB();

    const report = await Report.create({
      userId: user.id,
      companyName,
      industry,
      targetMarket,
      analysisType,
      businessDescription,
      websiteUrl,
      notes,
      status: "processing",
      aiScore: 0,
      reportData: {
        executiveSummary: "",
        marketAnalysis: "",
        competitorAnalysis: "",
        swot: "",
        riskAssessment: "",
        revenueOpportunities: "",
        recommendations: "",
      },
    });

    return NextResponse.json({ success: true, reportId: report._id });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
