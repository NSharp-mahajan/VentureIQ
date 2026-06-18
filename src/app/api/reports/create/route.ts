import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import { generateDueDiligenceReport, DueDiligenceInput } from "@/lib/ai/groq";

async function processReportInBackground(reportId: string, input: DueDiligenceInput) {
  try {
    await connectDB();
    const aiData = await generateDueDiligenceReport(input);
    
    await Report.findByIdAndUpdate(reportId, {
      status: "completed",
      reportData: aiData,
      aiScore: aiData.investmentScore || 0,
    });
  } catch (error) {
    console.error("Groq generation failed:", error);
    await connectDB();
    await Report.findByIdAndUpdate(reportId, {
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Failed to generate AI report.",
    });
  }
}

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
        riskAssessment: "",
        swot: { strengths: [], weaknesses: [], opportunities: [], threats: [] },
        investmentScore: 0,
        recommendation: "",
        keyInsights: [],
      },
    });

    const aiInput: DueDiligenceInput = {
      companyName,
      industry,
      targetMarket,
      analysisType,
      businessDescription,
      additionalNotes: notes,
    };

    // Fire and forget background process
    processReportInBackground(report._id, aiInput);

    return NextResponse.json({ success: true, reportId: report._id });
  } catch (error) {
    console.error("Error creating report:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Internal Server Error" 
    }, { status: 500 });
  }
}
