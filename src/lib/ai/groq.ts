import Groq from "groq-sdk";

export interface DueDiligenceInput {
  companyName: string;
  industry?: string;
  targetMarket?: string;
  analysisType: string;
  businessDescription?: string;
  additionalNotes?: string;
  scrapedData?: {
    title: string;
    description: string;
    content: string;
  };
  documentsData?: {
    fileName: string;
    fileType: string;
    extractedText: string;
    analysis?: {
      executiveSummary?: string;
      keyBusinessHighlights?: string[];
      financialMentions?: string[];
      productInformation?: string;
      risks?: string[];
      teamInformation?: string;
      marketInformation?: string;
      missingInformation?: string[];
    };
  }[];
}

export async function generateDueDiligenceReport(input: DueDiligenceInput) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing in .env.local");
  }

  const groq = new Groq({ apiKey });

  let prompt = `You are an expert AI due diligence analyst. Your job is to analyze the following company and generate a highly professional due diligence report.
  
Company Name: ${input.companyName}
Industry: ${input.industry || "Not provided"}
Target Market: ${input.targetMarket || "Not provided"}
Analysis Type: ${input.analysisType}
Business Description: ${input.businessDescription || "Not provided"}
Additional Notes: ${input.additionalNotes || "None"}
`;

  if (input.scrapedData) {
    prompt += `
Additionally, we have extracted the following information directly from the company's website. Please use this website information as a PRIMARY source for your analysis.

Website Title: ${input.scrapedData.title}
Website Description: ${input.scrapedData.description}
Website Content:
${input.scrapedData.content}
`;
  }

  if (input.documentsData && input.documentsData.length > 0) {
    prompt += `
Additionally, the user has uploaded the following internal documents. We have pre-analyzed them to extract key insights. Please treat this extracted intelligence as a highly credible PRIMARY source for your analysis. If you use this information, attribute it to "Uploaded Documents" in the sourceAttribution mapping.
`;
    input.documentsData.forEach((doc, idx) => {
      prompt += `
--- Document ${idx + 1}: ${doc.fileName} ---
`;
      if (doc.analysis) {
        prompt += `
Document AI Analysis:
- Executive Summary: ${doc.analysis.executiveSummary || "N/A"}
- Key Highlights: ${doc.analysis.keyBusinessHighlights?.join(", ") || "N/A"}
- Financial Mentions: ${doc.analysis.financialMentions?.join(", ") || "N/A"}
- Product Info: ${doc.analysis.productInformation || "N/A"}
- Risks: ${doc.analysis.risks?.join(", ") || "N/A"}
- Team: ${doc.analysis.teamInformation || "N/A"}
- Market Info: ${doc.analysis.marketInformation || "N/A"}
`;
      }
      
      prompt += `
Raw Text Preview (Truncated):
${doc.extractedText.substring(0, 3000)}...
`;
    });
  }

  prompt += `
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
  "keyInsights": ["Insight 1", "Insight 2", "Insight 3"],
  "competitorAnalysis": {
    "topCompetitors": [
      {
        "name": "Competitor Name",
        "reason": "Why they are a competitor",
        "differentiation": "How this company differentiates from them"
      }
    ],
    "summary": "Summary of competitive landscape"
  },
  "redFlags": [
    {
      "title": "Red flag title",
      "severity": "low", 
      "description": "Red flag description"
    }
  ],
  "growthOpportunities": [
    {
      "title": "Opportunity title",
      "description": "Opportunity description",
      "timeframe": "short-term" 
    }
  ],
  "scoreBreakdown": {
    "marketOpportunity": { "score": 80, "reason": "Explanation of score" },
    "productStrength": { "score": 75, "reason": "Explanation of score" },
    "scalability": { "score": 90, "reason": "Explanation of score" },
    "competitiveMoat": { "score": 60, "reason": "Explanation of score" },
    "riskLevel": { "score": 70, "reason": "Explanation of score" }
  },
  "investmentVerdict": {
    "label": "STRONG_BUY",
    "summary": "Brief summary of the verdict",
    "reasoning": "Detailed explanation of why this verdict was chosen.",
    "strengths": ["Major strength contributing to verdict"],
    "weaknesses": ["Major weakness contributing to verdict"],
    "assumptions": ["Assumptions made by AI in reaching this verdict"]
  },
  "dataQuality": {
    "websiteAnalyzed": true,
    "documentsAnalyzed": 1,
    "completeness": "high",
    "missingInfo": ["List of missing information like 'Financials' or 'Team'"],
    "estimatedReliability": 85
  },
  "sectionConfidence": {
    "executiveSummary": 90,
    "marketAnalysis": 85,
    "riskAssessment": 80,
    "competitorAnalysis": 75,
    "financialHealth": 0
  },
  "sourceAttribution": {
    "executiveSummary": ["Website", "AI Inference"],
    "marketAnalysis": ["Uploaded Documents", "AI Inference"],
    "riskAssessment": ["AI Inference", "User Input"],
    "keyInsights": ["Website", "Uploaded Documents"],
    "swot": ["AI Inference"],
    "competitorAnalysis": ["Website", "AI Inference"],
    "growthOpportunities": ["AI Inference"],
    "redFlags": ["Uploaded Documents", "AI Inference"]
  }
}

Ensure that all numeric scores are integers from 0 to 100. For red flag severity use exactly "low", "medium", or "high". For timeframe use exactly "short-term", "mid-term", or "long-term". For dataQuality completeness use exactly "low", "medium", or "high". Be realistic and grounded in the provided context for your score breakdowns, competitors, red flags, and growth opportunities. Ensure sourceAttribution accurately reflects where the data originated (Website, Uploaded Documents, User Input, or AI Inference).
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

export interface RawNewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
}

export interface AnalyzedNewsArticle {
  aiSummary: string;
  investorTakeaways: string[];
  marketImpact: string;
  sentiment: "Bullish" | "Neutral" | "Bearish";
  confidenceScore: number;
  category: string;
}

export async function analyzeNewsBatch(articles: RawNewsArticle[]): Promise<AnalyzedNewsArticle[]> {
  if (articles.length === 0) return [];
  
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing in .env.local");
  }

  const groq = new Groq({ apiKey });

  const prompt = `You are an expert market intelligence AI. I will provide you with a list of news articles. 
For each article, you must generate a financial intelligence analysis.

Articles:
${articles.map((a, i) => `
[Article ${i}]
Title: ${a.title}
Description: ${a.description}
Source: ${a.source}
`).join("\n")}

You must return ONLY a raw, valid JSON object with a single key "results" containing exactly ${articles.length} objects, in the same order as the articles provided.
Do not include markdown code blocks.

JSON format:
{
  "results": [
    {
      "aiSummary": "1-2 sentence concise summary.",
      "investorTakeaways": ["Takeaway 1", "Takeaway 2"],
      "marketImpact": "Brief description of the impact on the market",
      "sentiment": "Bullish",
      "confidenceScore": 85,
      "category": "Funding"
    }
  ]
}
`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: "You are an expert financial analyst. Always output pure, valid JSON matching the requested schema." },
      { role: "user", content: prompt },
    ],
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    response_format: { type: "json_object" },
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) throw new Error("No content received from Groq.");

  let jsonString = content.trim();
  if (jsonString.startsWith("\`\`\`json")) {
    jsonString = jsonString.replace(/^\`\`\`json/, "").replace(/\`\`\`$/, "").trim();
  } else if (jsonString.startsWith("\`\`\`")) {
    jsonString = jsonString.replace(/^\`\`\`/, "").replace(/\`\`\`$/, "").trim();
  }

  const parsed = JSON.parse(jsonString);
  return parsed.results || [];
}
