import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NewsCardProps {
  article: {
    title: string;
    description: string;
    source: string;
    publishedAt: string;
    imageUrl?: string;
    articleUrl: string;
    aiSummary: string;
    investorTakeaways: string[];
    marketImpact: string;
    sentiment: string;
    confidenceScore: number;
    category: string;
  }
}

export function NewsCard({ article }: NewsCardProps) {
  const getSentimentIcon = () => {
    if (article.sentiment === "Bullish") return <TrendingUp className="w-3 h-3 mr-1" />;
    if (article.sentiment === "Bearish") return <TrendingDown className="w-3 h-3 mr-1" />;
    return <Minus className="w-3 h-3 mr-1" />;
  };

  const getSentimentColor = () => {
    if (article.sentiment === "Bullish") return "bg-green-500/10 text-green-600 border-green-500/20";
    if (article.sentiment === "Bearish") return "bg-red-500/10 text-red-600 border-red-500/20";
    return "bg-slate-500/10 text-slate-600 border-slate-500/20";
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow group">
      {article.imageUrl && (
        <div className="w-full h-48 relative bg-secondary/50 overflow-hidden">
          {/* We use standard img to avoid Next.js external domain image configuration errors for dynamic news sources */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-2 left-2 flex gap-2">
            <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
              {article.source}
            </Badge>
            <Badge className={getSentimentColor() + " backdrop-blur-sm font-medium border"}>
              {getSentimentIcon()}
              {article.sentiment}
            </Badge>
          </div>
        </div>
      )}
      <CardContent className="p-5">
        {!article.imageUrl && (
          <div className="flex gap-2 mb-3">
            <Badge variant="secondary">{article.source}</Badge>
            <Badge className={getSentimentColor() + " font-medium border"}>
              {getSentimentIcon()}
              {article.sentiment}
            </Badge>
          </div>
        )}
        
        <h3 className="font-bold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
          <a href={article.articleUrl} target="_blank" rel="noopener noreferrer" className="flex items-start">
            {article.title}
            <ExternalLink className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-1" />
          </a>
        </h3>
        
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {article.aiSummary}
        </p>

        <div className="bg-secondary/30 rounded-md p-3 mb-4 border border-border/50">
          <p className="text-xs font-semibold text-foreground mb-1 uppercase tracking-wider">Investor Takeaway</p>
          <ul className="text-sm space-y-1">
            {article.investorTakeaways?.slice(0, 2).map((takeaway, idx) => (
              <li key={idx} className="flex items-start">
                <span className="text-primary mr-2">•</span>
                <span className="text-muted-foreground">{takeaway}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="font-medium text-foreground">{article.confidenceScore}%</span> AI Confidence
          </span>
          <span>{formatDistanceToNow(new Date(article.publishedAt))} ago</span>
        </div>
      </CardContent>
    </Card>
  );
}
