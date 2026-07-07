import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MarketNewsCache from "@/models/MarketNewsCache";
import { analyzeNewsBatch, RawNewsArticle } from "@/lib/ai/groq";

const MOCK_NEWS = [
  {
    title: "OpenAI Announces GPT-5 Release Timeline",
    description: "The AI giant has officially scheduled the highly anticipated GPT-5 model for late Q4, promising reasoning capabilities that rival expert human performance across diverse fields.",
    source: "TechCrunch",
    url: "https://techcrunch.com/mock-openai-gpt5",
    publishedAt: new Date().toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Stripe Acquires Fintech Startup Bridge in $1B Deal",
    description: "Payments giant Stripe expands its stablecoin infrastructure by acquiring Bridge, sending ripples through the digital assets and fintech markets.",
    source: "Bloomberg",
    url: "https://bloomberg.com/mock-stripe-bridge",
    publishedAt: new Date().toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1620321023374-d1a68fbc720d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Venture Capital Funding Rebounds in Q3",
    description: "Global VC funding grew by 15% quarter-over-quarter, driven largely by mega-rounds in generative AI, clean energy, and defense tech startups.",
    source: "Financial Times",
    url: "https://ft.com/mock-vc-rebound",
    publishedAt: new Date().toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?auto=format&fit=crop&q=80&w=800",
  },
  {
    title: "Databricks Prepares for Highly Anticipated IPO",
    description: "Data and AI powerhouse Databricks is reportedly meeting with bankers to orchestrate what could be the largest software IPO of the decade.",
    source: "Wall Street Journal",
    url: "https://wsj.com/mock-databricks-ipo",
    publishedAt: new Date().toISOString(),
    imageUrl: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800",
  }
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "All";
    
    await connectDB();

    const apiKey = process.env.NEWS_API_KEY;
    let rawArticles: RawNewsArticle[] = [];

    if (apiKey) {
      // Use GNews if API key exists
      let query = 'startup OR "venture capital" OR "artificial intelligence" OR SaaS OR fintech';
      if (category !== "All") {
        query = `${category} AND (${query})`;
      }

      const res = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=en&max=10&apikey=${apiKey}`);
      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rawArticles = (data.articles || []).map((a: any) => ({
          title: a.title,
          description: a.description,
          source: a.source.name,
          url: a.url,
          publishedAt: a.publishedAt,
          imageUrl: a.image,
        }));
      } else {
        console.warn("GNews API failed, falling back to mock");
        rawArticles = MOCK_NEWS;
      }
    } else {
      // Fallback to mock
      rawArticles = MOCK_NEWS;
    }

    if (rawArticles.length === 0) {
      return NextResponse.json({ articles: [] });
    }

    // Process uncached articles
    const results = [];
    const uncachedArticles = [];

    for (const article of rawArticles) {
      const cached = await MarketNewsCache.findOne({ articleUrl: article.url });
      if (cached) {
        results.push(cached);
      } else {
        uncachedArticles.push(article);
      }
    }

    if (uncachedArticles.length > 0) {
      // Batch analyze with Groq
      try {
        const groqAnalyses = await analyzeNewsBatch(uncachedArticles);
        
        const newCaches = [];
        for (let i = 0; i < uncachedArticles.length; i++) {
          const raw = uncachedArticles[i];
          const analysis = groqAnalyses[i];
          
          if (!analysis) continue;

          const doc = new MarketNewsCache({
            articleUrl: raw.url,
            title: raw.title,
            description: raw.description,
            source: raw.source,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            publishedAt: (raw as any).publishedAt || new Date().toISOString(),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            imageUrl: (raw as any).imageUrl,
            aiSummary: analysis.aiSummary,
            investorTakeaways: analysis.investorTakeaways,
            marketImpact: analysis.marketImpact,
            sentiment: analysis.sentiment,
            confidenceScore: analysis.confidenceScore,
            category: analysis.category,
          });

          await doc.save();
          newCaches.push(doc);
        }
        
        results.push(...newCaches);
      } catch (err) {
        console.error("Groq Analysis Error:", err);
        // If Groq fails, we just don't return the uncached ones this time to avoid breaking the whole feed
      }
    }

    // Sort by newest first
    results.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    return NextResponse.json({ articles: results });
  } catch (error) {
    console.error("Market Intelligence Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
