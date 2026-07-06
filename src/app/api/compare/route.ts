import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { connectDB } from "@/lib/db";
import Report from "@/models/Report";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { reportIdA, reportIdB } = await req.json();
    if (!reportIdA || !reportIdB) {
      return NextResponse.json({ error: "Both report IDs are required" }, { status: 400 });
    }

    await connectDB();

    const [reportA, reportB] = await Promise.all([
      Report.findOne({ _id: reportIdA, userId: user.id }).lean(),
      Report.findOne({ _id: reportIdB, userId: user.id }).lean()
    ]);

    if (!reportA || !reportB) {
      return NextResponse.json({ error: "One or both reports not found" }, { status: 404 });
    }

    // Build context
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const buildReportContext = (r: any) => {
      let ctx = `Company: ${r.companyName}\n`;
      ctx += `Industry: ${r.industry || "N/A"}\n`;
      ctx += `Target Market: ${r.targetMarket || "N/A"}\n`;
      ctx += `Score: ${r.reportData?.investmentScore || r.aiScore || "N/A"}/100\n`;
      ctx += `Verdict: ${r.reportData?.investmentVerdict?.label || r.verdict || "N/A"}\n`;
      
      if (r.reportData?.executiveSummary) ctx += `Summary: ${r.reportData.executiveSummary}\n`;
      
      if (r.reportData?.swot) {
        ctx += `Strengths: ${r.reportData.swot.strengths?.join(", ")}\n`;
        ctx += `Weaknesses: ${r.reportData.swot.weaknesses?.join(", ")}\n`;
      }
      
      if (r.reportData?.riskAssessment) ctx += `Risks: ${r.reportData.riskAssessment}\n`;
      
      return ctx;
    };

    const prompt = `
You are an expert VC Analyst comparing two companies for potential investment.
Based on the following data, generate a highly analytical and structured comparison.

--- REPORT A ---
${buildReportContext(reportA)}

--- REPORT B ---
${buildReportContext(reportB)}

You MUST return a JSON object with EXACTLY the following structure (do NOT wrap in markdown \`\`\`json blocks, just return raw JSON):
{
  "executiveComparison": "A 2-3 sentence high-level summary comparing the two.",
  "strengthsComparison": "A detailed comparison of their strengths.",
  "weaknessesComparison": "A detailed comparison of their weaknesses.",
  "marketComparison": "How their target markets and opportunities compare.",
  "competitiveAdvantage": "Which company has a stronger moat and why.",
  "riskComparison": "A comparison of their risk profiles.",
  "investmentRecommendation": "Your final recommendation to an investor.",
  "finalWinner": "The exact company name of the winner, or 'Tie'",
  "confidenceScore": 85
}
`;

    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: prompt }],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq");
    }

    const comparisonData = JSON.parse(content);

    return NextResponse.json({ 
      success: true, 
      comparison: comparisonData,
      reportA: {
        _id: reportA._id,
        companyName: reportA.companyName,
        score: reportA.reportData?.investmentScore || reportA.aiScore || 0,
        verdict: reportA.reportData?.investmentVerdict?.label || reportA.verdict || "UNKNOWN",
        scoreBreakdown: reportA.reportData?.scoreBreakdown
      },
      reportB: {
        _id: reportB._id,
        companyName: reportB.companyName,
        score: reportB.reportData?.investmentScore || reportB.aiScore || 0,
        verdict: reportB.reportData?.investmentVerdict?.label || reportB.verdict || "UNKNOWN",
        scoreBreakdown: reportB.reportData?.scoreBreakdown
      }
    });

  } catch (error: any) {
    console.error("Comparison Error:", error);
    return NextResponse.json({ error: "Internal Server Error", details: error.message }, { status: 500 });
  }
}
