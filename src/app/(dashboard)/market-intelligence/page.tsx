"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { MarketStats } from "@/components/market/MarketStats";
import { NewsCard } from "@/components/market/NewsCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Loader2 } from "lucide-react";

export default function MarketIntelligencePage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [articles, setArticles] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [category, setCategory] = useState("All");

  const categories = ["All", "startup", "venture capital", "artificial intelligence", "SaaS", "fintech"];

  useEffect(() => {
    async function fetchNews() {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/market-intelligence?category=${encodeURIComponent(category)}`);
        if (res.ok) {
          const data = await res.json();
          setArticles(data.articles || []);
          setStats(data.stats || null);
        }
      } catch (error) {
        console.error("Failed to fetch news:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchNews();
  }, [category]);


  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      <Header />
      <main className="flex-1 overflow-y-auto p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold font-heading tracking-tight mb-2">Market Intelligence</h1>
              <p className="text-muted-foreground">
                Real-time AI analysis of global startup, VC, and tech news.
              </p>
            </div>
            
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search market..." 
                  className="pl-9 bg-secondary/50 border-border/50 focus-visible:ring-primary/50" 
                />
              </div>
            </div>
          </div>

          <MarketStats stats={stats} />

          <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "secondary"}
                size="sm"
                onClick={() => setCategory(cat)}
                className="whitespace-nowrap capitalize"
              >
                {cat}
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary/50 mb-4" />
              <p className="text-muted-foreground animate-pulse">Aggregating market intelligence and running Groq AI analysis...</p>
            </div>
          ) : articles.length === 0 ? (
            <div className="text-center py-20 bg-secondary/20 rounded-xl border border-dashed border-border/50">
              <p className="text-muted-foreground">No news found for this category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {articles.map((article, idx) => (
                <NewsCard key={idx} article={article} />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
