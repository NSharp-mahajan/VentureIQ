import Groq from "groq-sdk";
import { ICompetitor } from "@/models/CompetitorDiscovery";

export async function discoverCompetitors(companyName: string, industry: string, description: string): Promise<Partial<ICompetitor>[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("GROQ_API_KEY is missing");
  const groq = new Groq({ apiKey });

  const prompt = `You are a Tier 1 Venture Capital analyst. Identify 5-8 competitors for the following company.

Company: ${companyName}
Industry: ${industry}
Description: ${description}

Return ONLY a valid JSON array of objects, with no markdown formatting. Each object must have:
- name: string
- industry: string
- headquarters: string
- foundedYear: string
- estimatedSize: string (e.g. "Seed", "Series B", "Public", "10-50 employees")
- oneLineDescription: string
- whyCompetitor: string
- differentiation: string
- type: "Direct" | "Indirect" | "Emerging" | "Leader"

Ensure the JSON is perfectly formatted.`;

  const completion = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: "llama3-8b-8192",
    temperature: 0.2,
  });

  const content = completion.choices[0]?.message?.content || "[]";
  try {
    const match = content.match(/\[[\s\S]*\]/);
    const jsonStr = match ? match[0] : content.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Failed to parse discoverCompetitors JSON:", error, content);
    return [];
  }
}
