import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Flame, Diamond, Coins } from 'lucide-react'
import { PageLayout } from "@/components/ui/PageLayout";

// Helper function to format percentage values
const formatPercentage = (value: number | string) => {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  return {
    className: `percentage-value ${numValue >= 0 ? 'percentage-positive' : 'percentage-negative'}`,
    text: `${numValue >= 0 ? '+' : ''}${numValue.toFixed(2)}%`
  };
};

export default function ExplorePage() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Explorer</h1>
          <p className="text-muted-foreground">Find the most profitable LPs across protocols</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Best APR Pairs */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Flame className="h-5 w-5 text-primary" />
                Best APR Pairs
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { rank: 1, pair: "XLM/USDC", apr: 168.67 },
                { rank: 2, pair: "yXLM/USDC", apr: 126.86 },
                { rank: 3, pair: "yBTC/XLM", apr: 103.61 },
                { rank: 4, pair: "USDC/yETH", apr: 64.48 },
                { rank: 5, pair: "yUSDC/USDC", apr: -12.36 },
              ].map((item) => (
                <div key={item.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{item.rank}</span>
                    <span className="text-card-foreground font-medium">{item.pair}</span>
                  </div>
                  <span className={formatPercentage(item.apr).className}>
                    {formatPercentage(item.apr).text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Best Blue-chip Pools */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Diamond className="h-5 w-5 text-primary" />
                Best Blue-chip Pools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { rank: 1, pair: "XLM/USDC", apr: 168.67 },
                { rank: 2, pair: "BTC/XLM", apr: 45.22 },
                { rank: 3, pair: "ETH/USDC", apr: 27.46 },
                { rank: 4, pair: "BTC/USDC", apr: 21.69 },
                { rank: 5, pair: "ETH/XLM", apr: 18.88 },
              ].map((item) => (
                <div key={item.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{item.rank}</span>
                    <span className="text-card-foreground font-medium">{item.pair}</span>
                  </div>
                  <span className={formatPercentage(item.apr).className}>
                    {formatPercentage(item.apr).text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Best Stable Coin Pools */}
          <Card className="bg-card border-border hover:border-primary/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Coins className="h-5 w-5 text-primary" />
                Best Stable Coin Pools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { rank: 1, pair: "USDC/USDT", apr: 69.53 },
                { rank: 2, pair: "USDC/yUSDC", apr: 23.07 },
                { rank: 3, pair: "USDC/yUSDT", apr: 22.59 },
                { rank: 4, pair: "USDT/yUSDC", apr: 18.73 },
                { rank: 5, pair: "yUSDT/USDC", apr: 0.37 },
              ].map((item) => (
                <div key={item.rank} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground">#{item.rank}</span>
                    <span className="text-card-foreground font-medium">{item.pair}</span>
                  </div>
                  <span className={formatPercentage(item.apr).className}>
                    {formatPercentage(item.apr).text}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="border-border bg-card">
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex gap-2">
                <Button variant="secondary">All Pools</Button>
                <Button variant="ghost">Top Wallets</Button>
              </div>
              <Button variant="outline">
                How to add liquidity & earn fees
              </Button>
            </div>

            <div className="flex flex-wrap gap-4">
              <Select defaultValue="stellar">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select chain" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stellar">Stellar Network</SelectItem>
                </SelectContent>
              </Select>

              <Select defaultValue="24h">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="24h">24H APR</SelectItem>
                  <SelectItem value="7d">7D APR</SelectItem>
                  <SelectItem value="30d">30D APR</SelectItem>
                </SelectContent>
              </Select>

              <Button variant="secondary">Advanced Filter</Button>

              <div className="flex-1 min-w-[200px]">
                <Input placeholder="Search by token/pair/pool address" />
              </div>

              <Button variant="secondary">Reset</Button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-medium">Protocol</TableHead>
                  <TableHead className="font-medium">Pair/Pool</TableHead>
                  <TableHead className="font-medium">24H APR(Est.)</TableHead>
                  <TableHead className="font-medium">TVL</TableHead>
                  <TableHead className="font-medium">24h Volume</TableHead>
                  <TableHead className="font-medium">24h Fees</TableHead>
                  <TableHead className="font-medium">Price Volatil</TableHead>
                  <TableHead className="font-medium">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-muted-foreground">StellarDEX</TableCell>
                  <TableCell className="text-foreground font-medium">XLM/USDC</TableCell>
                  <TableCell className={formatPercentage(1683.67).className}>
                    {formatPercentage(1683.67).text}
                  </TableCell>
                  <TableCell className="text-muted-foreground">$94.1K</TableCell>
                  <TableCell className="text-muted-foreground">$4.7M</TableCell>
                  <TableCell className="text-muted-foreground">$4.3K</TableCell>
                  <TableCell className={formatPercentage(2.53).className}>
                    {formatPercentage(2.53).text}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Details</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">StellarSwap</TableCell>
                  <TableCell className="text-foreground font-medium">BTC/XLM</TableCell>
                  <TableCell className={formatPercentage(872.45).className}>
                    {formatPercentage(872.45).text}
                  </TableCell>
                  <TableCell className="text-muted-foreground">$152.3K</TableCell>
                  <TableCell className="text-muted-foreground">$2.9M</TableCell>
                  <TableCell className="text-muted-foreground">$2.1K</TableCell>
                  <TableCell className={formatPercentage(-1.12).className}>
                    {formatPercentage(-1.12).text}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Details</Button>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="text-muted-foreground">LumenLiquid</TableCell>
                  <TableCell className="text-foreground font-medium">ETH/USDC</TableCell>
                  <TableCell className={formatPercentage(534.19).className}>
                    {formatPercentage(534.19).text}
                  </TableCell>
                  <TableCell className="text-muted-foreground">$78.6K</TableCell>
                  <TableCell className="text-muted-foreground">$1.8M</TableCell>
                  <TableCell className="text-muted-foreground">$1.5K</TableCell>
                  <TableCell className={formatPercentage(2.87).className}>
                    {formatPercentage(2.87).text}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">Details</Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </PageLayout>
  )
}

