import Groq from "groq-sdk";
import { IDocumentAnalysis } from "@/types/report";

const DOCUMENT_ANALYSIS_PROMPT = `
You are an expert M&A Due Diligence AI. Your task is to extract critical business intelligence from the provided document text.
You must return the analysis strictly as a JSON object matching this TypeScript interface:

export interface IDocumentAnalysis {
  executiveSummary: string;
  keyBusinessHighlights: string[];
  financialMentions: string[];
  productInformation: string;
  risks: string[];
  teamInformation: string;
  marketInformation: string;
  missingInformation: string[];
}

Guidelines:
- **executiveSummary**: A concise summary of what this document is and its main purpose (1-2 paragraphs).
- **keyBusinessHighlights**: 3-5 bullet points of the most important takeaways.
- **financialMentions**: Any mentions of revenue, costs, funding, metrics, or financial projections. If none, return empty array.
- **productInformation**: Details about the product, service, technology, or intellectual property.
- **risks**: Any red flags, dependencies, or competitive threats mentioned in the document.
- **teamInformation**: Mentions of founders, key employees, or advisors.
- **marketInformation**: Mentions of target market, market size, or competitors.
- **missingInformation**: What critical context seems to be missing from this document that would typically be expected?

Extract as much detail as possible, but if a category has no relevant information in the text, return an empty string or empty array.
Output ONLY valid JSON.
`;

export async function analyzeDocument(text: string, fileName: string): Promise<IDocumentAnalysis> {
  try {
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      throw new Error("GROQ_API_KEY is missing in .env.local");
    }
    const groq = new Groq({ apiKey });

    const prompt = `
    DOCUMENT NAME: ${fileName}
    DOCUMENT TEXT (Truncated if too long):
    ---
    ${text}
    ---
    ${DOCUMENT_ANALYSIS_PROMPT}
    `;

    const response = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.1,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Empty response from Groq");
    }

    const parsed = JSON.parse(content) as IDocumentAnalysis;
    return parsed;
  } catch (error) {
    console.error(`Failed to analyze document ${fileName}:`, error);
    // Return empty defaults
    return {
      executiveSummary: "Analysis failed or document was unreadable.",
      keyBusinessHighlights: [],
      financialMentions: [],
      productInformation: "",
      risks: [],
      teamInformation: "",
      marketInformation: "",
      missingInformation: ["Could not extract information due to analysis error."],
    };
  }
}
