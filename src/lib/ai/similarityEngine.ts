import Groq from "groq-sdk";
import { ICompetitor } from "@/models/CompetitorDiscovery";

export async function calculateSimilarityScores(companyName: string, competitors: Partial<ICompetitor>[]) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");
  const groq = new Groq({ apiKey });

  const competitorNames = competitors.map(c => c.name).join(", ");

  const prompt = `Calculate granular similarity scores between ${companyName} and its competitors: ${competitorNames}.

Return ONLY a valid JSON array matching the exact order of the competitors provided. No markdown formatting.

[
  {
    "name": "Competitor Name",
    "similarityScore": 85, // Overall 0-100
    "confidenceScore": 90, // AI Confidence 0-100
    "similarity": {
      "marketOverlap": 80, // 0-100
      "technologyOverlap": 70, // 0-100
      "customerOverlap": 90, // 0-100
      "productOverlap": 85, // 0-100
      "overallIntensity": 85 // 0-100
    }
  }
]`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama3-8b-8192",
    temperature: 0.1,
  });

  const content = completion.choices[0]?.message?.content || "[]";
  try {
    const match = content.match(/\[[\s\S]*\]/);
    const jsonStr = match ? match[0] : content.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse calculateSimilarityScores JSON:", error, content);
    return null;
  }
}
