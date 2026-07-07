import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Activity, Target, Landmark } from "lucide-react";

export function MarketStats() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Global VC Funding</p>
              <h3 className="text-2xl font-bold mt-1">$4.2B</h3>
              <p className="text-xs text-green-500 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +12% vs last week
              </p>
            </div>
            <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
              <Landmark className="w-6 h-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">M&A Activity</p>
              <h3 className="text-2xl font-bold mt-1">12 Deals</h3>
              <p className="text-xs text-green-500 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +2 since yesterday
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center">
              <Target className="w-6 h-6 text-blue-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Trending Sector</p>
              <h3 className="text-2xl font-bold mt-1">Gen AI</h3>
              <p className="text-xs text-green-500 mt-1 flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                High Conviction
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Market Sentiment</p>
              <h3 className="text-2xl font-bold mt-1 text-green-600">Bullish</h3>
              <p className="text-xs text-muted-foreground mt-1">
                75% Confidence
              </p>
            </div>
            <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
