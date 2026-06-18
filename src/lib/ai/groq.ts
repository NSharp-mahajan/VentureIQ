import Groq from "groq-sdk";

export interface DueDiligenceInput {
  companyName: string;
  industry?: string;
  targetMarket?: string;
  analysisType: string;
  businessDescription?: string;
  additionalNotes?: string;
}

export async function generateDueDiligenceReport(input: DueDiligenceInput) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing in .env.local");
  }

  const groq = new Groq({ apiKey });

  const prompt = `You are an expert AI due diligence analyst. Your job is to analyze the following company and generate a highly professional due diligence report.
  
Company Name: ${input.companyName}
Industry: ${input.industry || "Not provided"}
Target Market: ${input.targetMarket || "Not provided"}
Analysis Type: ${input.analysisType}
Business Description: ${input.businessDescription || "Not provided"}
Additional Notes: ${input.additionalNotes || "None"}

You must return ONLY a raw, valid JSON object matching the exact structure below. Do not include markdown code blocks (like \`\`\`json). Do not add any text before or after the JSON.

{
  "executiveSummary": "A concise overview of the business, its core value proposition, and the primary reason it exists.",
  "marketAnalysis": "Detailed analysis of the industry, market size, trends, and competitors...",
  "riskAssessment": "Key operational, financial, and market risks, along with potential mitigations...",
  "swot": {
    "strengths": ["Strength 1", "Strength 2"],
    "weaknesses": ["Weakness 1", "Weakness 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"],
    "threats": ["Threat 1", "Threat 2"]
  },
  "investmentScore": 85,
  "recommendation": "Final verdict on the business viability and investment potential...",
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"]
}
`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are an expert financial and business analyst. Always output pure, valid JSON matching the exact schema." },
      { role: "user", content: prompt },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No content received from Groq.");

  // Remove potential markdown blocks if the model ignored instructions
  let jsonString = content.trim();
  if (jsonString.startsWith("```json")) {
    jsonString = jsonString.replace(/^```json/, "").replace(/```$/, "").trim();
  } else if (jsonString.startsWith("```")) {
    jsonString = jsonString.replace(/^```/, "").replace(/```$/, "").trim();
  }

  return JSON.parse(jsonString);
}
