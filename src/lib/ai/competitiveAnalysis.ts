import Groq from "groq-sdk";
import { ICompetitor } from "@/models/CompetitorDiscovery";

export async function generateCompetitiveAnalysis(companyName: string, competitors: Partial<ICompetitor>[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");
  const groq = new Groq({ apiKey });

  const competitorNames = competitors.map(c => c.name).join(", ");

  const prompt = `You are an elite Competitive Intelligence AI. Analyze the competitive landscape for ${companyName} against its top competitors: ${competitorNames}.

Return ONLY a valid JSON object with the following structure. No markdown formatting.

{
  "competitorComparisons": [
    // Array matching the exact order of the competitors provided
    {
      "name": "Competitor Name",
      "landscapeQuadrant": "Leader" | "Challenger" | "Visionary" | "Niche Player",
      "comparison": {
        "businessModel": "...",
        "targetCustomers": "...",
        "revenueStrategy": "...",
        "coreProducts": "...",
        "technology": "...",
        "goToMarket": "...",
        "pricing": "...",
        "distribution": "...",
        "strengths": ["...", "..."],
        "weaknesses": ["...", "..."],
        "competitiveMoat": "...",
        "marketOpportunity": "...",
        "scalability": "...",
        "risk": "...",
        "innovation": "...",
        "investmentPotential": "..."
      },
      "matrix": {
        "investmentScore": 85, // 0-100
        "marketPosition": 90, // 0-100
        "innovation": 80, // 0-100
        "growth": 75, // 0-100
        "risk": 40, // 0-100
        "moat": 85, // 0-100
        "funding": 95, // 0-100
        "overallVerdict": "..."
      },
      "timeline": [
        { "date": "YYYY", "event": "...", "type": "Founded" | "Funding" | "Product" | "Acquisition" | "Milestone" }
      ]
    }
  ],
  "swot": {
    "companySwot": {
      "strengths": ["..."],
      "weaknesses": ["..."],
      "opportunities": ["..."],
      "threats": ["..."]
    },
    "headToHeadSwot": [
      {
        "competitorName": "...",
        "sharedStrengths": ["..."],
        "uniqueStrengths": ["..."],
        "sharedRisks": ["..."],
        "competitiveAdvantages": ["..."]
      }
    ]
  },
  "opportunities": {
    "marketGaps": ["..."],
    "expansionOpportunities": ["..."],
    "potentialAcquisitions": ["..."],
    "potentialPartnerships": ["..."],
    "threats": ["..."]
  }
}

Ensure the JSON is strictly formatted and valid.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama-3.3-70b-versatile", // Using smaller model for speed, but if it fails we might need fallback
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content || "{}";
  try {
    const match = content.match(/\{[\s\S]*\}/);
    const jsonStr = match ? match[0] : content.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse competitiveAnalysis JSON:", error, content);
    return null;
  }
}
