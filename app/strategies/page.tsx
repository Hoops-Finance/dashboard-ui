import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Search, Settings2 } from 'lucide-react'
import { PageLayout } from "@/components/ui/PageLayout"

export default function StrategiesPage() {
  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header with metrics */}
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Strategies</h1>
          <p className="text-muted-foreground">Optimize your DeFi investment strategies</p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4 bg-card border-border">
            <div className="text-sm text-muted-foreground">AUM</div>
            <div className="text-2xl font-bold text-foreground">$11.8M</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-sm text-muted-foreground">Volume</div>
            <div className="text-2xl font-bold text-foreground">$376.5M</div>
          </Card>
          <Card className="p-4 bg-card border-border">
            <div className="text-sm text-muted-foreground">Fees Generated</div>
            <div className="text-2xl font-bold text-foreground">$7.6M</div>
          </Card>
        </div>

        {/* Strategy filters and search */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <Tabs defaultValue="best-apr" className="w-full md:w-auto">
            <TabsList>
              <TabsTrigger value="best-apr">Best APR</TabsTrigger>
              <TabsTrigger value="automated">Automated</TabsTrigger>
              <TabsTrigger value="high-cap">High Cap</TabsTrigger>
              <TabsTrigger value="stable">Stable</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <div className="relative flex-1 md:w-[300px]">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by token/pair/address"
                className="pl-8"
              />
            </div>
            <Button variant="outline" size="icon">
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Strategies list */}
        <div className="space-y-4">
          {strategies.map((strategy) => (
            <Card key={strategy.id} className="p-4 bg-card border-border">
              <div className="grid gap-4 md:grid-cols-7">
                <div className="flex items-center gap-3 md:col-span-2">
                  <div className="flex -space-x-2">
                    {strategy.tokens.map((token, i) => (
                      <div
                        key={i}
                        className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-2 ring-background"
                      >
                        {token.symbol}
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className="font-medium text-foreground">{strategy.name}</div>
                    <div className="text-sm text-muted-foreground">Strategy #{strategy.id}</div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Total Value</div>
                  <div className="font-medium text-foreground">${strategy.totalValue}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Fees Generated</div>
                  <div className="font-medium text-foreground">${strategy.feesGenerated}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Age</div>
                  <div className="font-medium text-foreground">{strategy.age}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">APR</div>
                  <div className="percentage-positive">{strategy.apr}%</div>
                </div>
                <div className="flex items-center justify-end gap-2">
                  <Button variant="outline" size="icon">
                    <Info className="h-4 w-4" />
                  </Button>
                  <Button>Deploy</Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Pro badge */}
        <div className="fixed bottom-4 right-4">
          <div className="bg-card text-card-foreground px-3 py-1.5 rounded-full text-sm font-medium border border-border">
            Pro Feature
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

const strategies = [
  {
    id: "8608556",
    name: "XLM/USDC Yield",
    tokens: [
      { symbol: "🌟" },
      { symbol: "💎" }
    ],
    totalValue: "317.75",
    feesGenerated: "1,120.76",
    age: "25 days",
    apr: "10,872.27"
  },
  {
    id: "8932821",
    name: "Stable Yield",
    tokens: [
      { symbol: "💫" },
      { symbol: "💰" }
    ],
    totalValue: "534.63",
    feesGenerated: "792.81",
    age: "5 days",
    apr: "10,706.23"
  },
  {
    id: "9005358",
    name: "Blue Chip Mix",
    tokens: [
      { symbol: "🌟" },
      { symbol: "💎" }
    ],
    totalValue: "196.137",
    feesGenerated: "33,667.54",
    age: "12 hours",
    apr: "10,257.25"
  },
  {
    id: "8993669",
    name: "Conservative Yield",
    tokens: [
      { symbol: "💫" },
      { symbol: "💰" }
    ],
    totalValue: "401.45",
    feesGenerated: "127.22",
    age: "1 day",
    apr: "9,501.63"
  }
]

