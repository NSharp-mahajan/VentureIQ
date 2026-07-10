import Groq from "groq-sdk";

export async function generateInvestmentRecommendation(companyName: string, competitorDataStr: string) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");
  const groq = new Groq({ apiKey });

  const prompt = `You are a top-tier Venture Capital Partner. You have just reviewed a detailed competitive analysis for ${companyName} and its competitors.

Based on this data:
${competitorDataStr.substring(0, 4000)} // truncated to save context

Provide a final Investment Recommendation. 
Return ONLY a valid JSON object. No markdown formatting.

{
  "recommendation": {
    "verdict": "Invest | Hold | Pass",
    "reasoning": "A highly professional, evidence-based paragraph explaining why, comparing it to the top competitors.",
    "topPick": "The name of the company that is the absolute best investment in this space (could be ${companyName} or a competitor)."
  }
}`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama3-8b-8192",
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content || "{}";
  try {
    const match = content.match(/\{[\s\S]*\}/);
    const jsonStr = match ? match[0] : content.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse investmentRecommendation JSON:", error, content);
    return null;
  }
}
