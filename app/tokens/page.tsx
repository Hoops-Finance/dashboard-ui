import { PageLayout } from "@/components/ui/PageLayout";
import { Card } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MarketMetrics } from "@/components/market-metrics"
import { TokensTable } from "@/components/tokens-table"

export default function TokensPage() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-white">Tokens</h1>
          <p className="text-gray-400">Explore and analyze token performance</p>
        </div>

        <MarketMetrics />
        
        <Card className="border rounded-lg bg-card">
          <div className="p-4">
            <Tabs defaultValue="hot" className="w-full">
              <TabsList>
                <TabsTrigger value="hot">Hot Tokens</TabsTrigger>
                <TabsTrigger value="rwa">Real World Assets</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <div className="p-4">
            <TokensTable />
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}

