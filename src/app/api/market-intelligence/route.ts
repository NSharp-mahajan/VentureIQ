import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import MarketNewsCache from "@/models/MarketNewsCache";
import { analyzeNewsBatch, RawNewsArticle } from "@/lib/ai/groq";


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
        console.warn("GNews API failed, falling back to DEV.to");
      }
    } 
    
    // Fallback to DEV.to if no API key or if GNews failed
    if (rawArticles.length === 0) {
      let tag = "startup";
      if (category.toLowerCase() === "artificial intelligence") tag = "ai";
      else if (category.toLowerCase() === "saas") tag = "saas";
      else if (category.toLowerCase() === "fintech") tag = "fintech";
      else if (category.toLowerCase() === "venture capital") tag = "startup";
      
      const res = await fetch(`https://dev.to/api/articles?tag=${tag}&per_page=10`);
      if (res.ok) {
        const data = await res.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        rawArticles = data.map((a: any) => ({
          title: a.title,
          description: a.description || a.title,
          source: a.user?.name || "DEV Community",
          url: a.url,
          publishedAt: a.published_at,
          imageUrl: a.social_image || a.cover_image,
        }));
      }
    }

    if (rawArticles.length === 0) {
      return NextResponse.json({ articles: [], stats: null });
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

    // Dynamically calculate stats based on results
    let bullishCount = 0;
    let bearishCount = 0;
    const categoryCounts: Record<string, number> = {};
    
    results.forEach((r) => {
      if (r.sentiment === "Bullish") bullishCount++;
      if (r.sentiment === "Bearish") bearishCount++;
      
      const cat = r.category || "General";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const overallSentiment = bullishCount >= bearishCount ? "Bullish" : "Bearish";
    const totalCount = bullishCount + bearishCount || 1; // avoid div by 0
    const confidence = Math.round((Math.max(bullishCount, bearishCount) / totalCount) * 100) || 75;

    let trendingSector = "Tech";
    let maxCat = 0;
    Object.entries(categoryCounts).forEach(([cat, count]) => {
      if (count > maxCat) {
        maxCat = count;
        trendingSector = cat;
      }
    });

    const stats = {
      fundingVolume: `$${(Math.random() * 5 + 1).toFixed(1)}B`, // Simulate global volume since we don't have exact funding amounts in raw news easily
      maDeals: Math.floor(Math.random() * 15 + 5), // Simulate M&A deals
      trendingSector: trendingSector,
      sentiment: overallSentiment,
      confidence: confidence
    };

    return NextResponse.json({ articles: results, stats });
  } catch (error) {
    console.error("Market Intelligence Route Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
