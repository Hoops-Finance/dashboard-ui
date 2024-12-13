import { Card } from "@/components/ui/card"
import { ArrowRight, TrendingUp, Activity, LineChart } from 'lucide-react'

export function MarketMetrics() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <Card className="p-6 bg-card">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-500" />
            <span className="font-semibold">Total Market Cap</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <div className="text-4xl font-bold">$3.4T</div>
          <div className="text-green-500 text-sm font-medium">↑2.1%</div>
        </div>
        <div className="mt-6 pt-4 border-t grid grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-muted-foreground mb-1">XLM</div>
            <div className="font-semibold">$2.0T</div>
            <div className="text-green-500 text-xs font-medium">↑2.94%</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-1">Stablecoins</div>
            <div className="font-semibold">$191.2B</div>
            <div className="text-green-500 text-xs font-medium">↑1%</div>
          </div>
        </div>
      </Card>

      <Card className="p-6 bg-card">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-500" />
            <span className="font-semibold">24hr Volume</span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <div className="text-4xl font-bold">$56.80B</div>
          <div className="text-green-500 text-sm font-medium">↑0.82%</div>
        </div>
        <div className="mt-6">
          <div className="inline-flex items-center px-2 py-1 rounded-full bg-green-500/10 text-green-500 text-sm font-medium">
            High Activity
          </div>
        </div>
      </Card>

      <div className="space-y-6">
        <Card className="p-6 bg-card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-orange-500" />
              <span className="font-semibold">Market Sentiment</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex items-center justify-center h-[100px]">
            <div className="text-2xl font-semibold text-muted-foreground">Neutral</div>
          </div>
        </Card>

        <Card className="p-6 bg-card">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2">
              <LineChart className="w-5 h-5 text-purple-500" />
              <span className="font-semibold">Altcoin Season</span>
            </div>
            <ArrowRight className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="mt-4">
            <div className="relative w-full h-2 bg-gradient-to-r from-red-500 via-green-500 to-red-500 rounded-full">
              <div className="absolute top-0 left-[33%] w-4 h-4 -mt-1 bg-green-500 rounded-full" />
            </div>
            <div className="mt-4 flex justify-between text-sm font-medium">
              <div>Bitcoin SEASON</div>
              <div>Altcoin SEASON</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

