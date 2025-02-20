"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function CryptoPortfolio() {
  const [activeTab, setActiveTab] = useState("wallet")
  const [showAllBalances, setShowAllBalances] = useState(false)
  const [showAllocation, setShowAllocation] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  // Combined wallet balances data for pie chart
  const walletPieData = [
    { name: "XLM", value: 69.14, color: "#FDB514", amount: "10,455.4" },
    { name: "AQUA", value: 10.04, color: "#9333EA", amount: "645.44" },
    { name: "BTC", value: 92.0, color: "#F97316", amount: "0.0023" },
    { name: "ETH", value: 339.91, color: "#3B82F6", amount: "0.15" },
    { name: "USDC (Checking)", value: 100.0, color: "#10B981", amount: "100" },
    { name: "Savings", value: 14.2, color: "#6366F1", amount: "14.2" },
  ]

  // Savings allocation data for pie chart
  const savingsPieData = [
    { name: "EURC/GBPC", value: 333.33, color: "#FDB514", amount: "333.33" },
    { name: "EURC/EURC", value: 333.33, color: "#9333EA", amount: "333.33" },
    { name: "USDC/XTAR", value: 333.33, color: "#F97316", amount: "333.33" },
  ]

  // Update the walletBalances array to include the "locked" property
  const walletBalances = [
    { asset: "XLM", address: "CA1K5...KL1E", amount: "10,455.4", value: "$69.14", locked: false },
    { asset: "AQUA", address: "CB1K5...YT3Q", amount: "645.44", value: "$10.04", locked: false },
    { asset: "BTC", address: "1BvBM...NJG4", amount: "0.0023", value: "$92.00", locked: false },
    { asset: "ETH", address: "0x742d...F3B9", amount: "0.15", value: "$339.91", locked: false },
    { asset: "USDC", address: "0x123...ABC", amount: "100", value: "$100.00", locked: false },
    { asset: "EURC/GBPC", address: "0x456...DEF", amount: "333.33", value: "$333.33", locked: true },
    { asset: "EURC/EURC", address: "0x789...GHI", amount: "333.33", value: "$333.33", locked: true },
    { asset: "USDC/XTAR", address: "0xABC...JKL", amount: "333.33", value: "$333.33", locked: true },
  ]

  // Update the total balance calculation
  const totalBalance = walletBalances.reduce(
    (sum, balance) => sum + Number.parseFloat(balance.value.replace("$", "")),
    0,
  )

  const poolDistribution = [
    {
      name: "EURC/GBPC",
      percentage: "136247.50%",
      platform: "aqua",
      score: 95.1,
      allocation: "33.33%",
      allocated: "$333.33",
    },
    {
      name: "EURC/EURC",
      percentage: "117.58%",
      platform: "aqua",
      score: 84.57,
      allocation: "33.33%",
      allocated: "$333.33",
    },
    {
      name: "USDC/XTAR",
      percentage: "53.10%",
      platform: "soroswap",
      score: 92.11,
      allocation: "33.33%",
      allocated: "$333.33",
    },
  ]

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const total = (activeTab === "wallet" ? walletPieData : savingsPieData).reduce(
        (sum, item) => sum + item.value,
        0
      )
      return (
        <div className="absolute bg-zinc-800/95 backdrop-blur-sm border border-zinc-700 p-3 rounded-lg shadow-xl max-w-[200px] transform transition-all duration-200 ease-in-out">
          <h3 className="text-base font-semibold mb-1 truncate">{data.name}</h3>
          <p className="text-lg font-bold text-[#00ff00]">${data.value.toFixed(2)}</p>
          <p className="text-zinc-400 text-xs mt-1">{((data.value / total) * 100).toFixed(2)}% of total</p>
          <div className="text-zinc-300 text-sm mt-2 flex items-center gap-1">
            <span>{data.amount}</span>
            <span className="text-zinc-500">{data.name.split("/")[0]}</span>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <div className="text-sm text-zinc-400">Total Balance</div>
              <div className="text-xl font-semibold mt-1 text-white">${totalBalance.toFixed(2)}</div>
              <div className="text-sm text-emerald-500">+ 20%</div>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <div className="text-sm text-zinc-400">Checking</div>
              <div className="text-xl font-semibold mt-1 text-white">100 USDC</div>
              <div className="text-sm text-emerald-500">+ 20%</div>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <div className="text-sm text-zinc-400">Savings</div>
              <div className="text-xl font-semibold mt-1 text-white">14.2 USD</div>
              <div className="text-sm text-emerald-500">+ 20%</div>
            </Card>
            <Card className="bg-zinc-900 border-zinc-800 p-4">
              <div className="text-sm text-zinc-400">APY</div>
              <div className="text-xl font-semibold mt-1 text-white">2.3%</div>
              <div className="text-sm text-emerald-500">+ 20%</div>
            </Card>
          </div>

          {/* Main Content */}
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Chart */}
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-4">Overview</h2>
              <div className="flex justify-center items-center h-[400px]">
                <PieChart width={400} height={400}>
                  <Pie
                    data={activeTab === "wallet" ? walletPieData : savingsPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={160}
                    paddingAngle={2}
                    dataKey="value"
                    onMouseEnter={(_, index) => setActiveIndex(index)}
                    onMouseLeave={() => setActiveIndex(null)}
                  >
                    {(activeTab === "wallet" ? walletPieData : savingsPieData).map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={activeIndex === null || activeIndex === index ? 1 : 0.5}
                      />
                    ))}
                  </Pie>
                  {activeIndex !== null && <RechartsTooltip content={<CustomTooltip />} />}
                </PieChart>
              </div>
            </div>

            {/* Right Column - Content based on active tab */}
            <div className="flex-1 space-y-6">
              <div className="space-y-4">
                <Tabs defaultValue="wallet" className="w-full">
                  <TabsList className="bg-zinc-800 border border-zinc-700 w-full">
                    <TabsTrigger
                      value="wallet"
                      className="flex-1 data-[state=active]:bg-zinc-900 data-[state=active]:text-white"
                      onClick={() => setActiveTab("wallet")}
                    >
                      Your Wallet
                    </TabsTrigger>
                    <TabsTrigger
                      value="savings"
                      className="flex-1 data-[state=active]:bg-zinc-900 data-[state=active]:text-white"
                      onClick={() => setActiveTab("savings")}
                    >
                      Savings
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <div className="flex justify-between items-center w-full">
                  <h2 className="text-3xl font-semibold">
                    {activeTab === "wallet" ? `~ ${totalBalance.toFixed(2)} USD` : "~ 1,000.00 USD"}
                  </h2>
                  {activeTab === "wallet" ? (
                    <Button
                      variant="ghost"
                      className="text-zinc-400"
                      onClick={() => setShowAllBalances(!showAllBalances)}
                    >
                      All Balances{" "}
                      {showAllBalances ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      className="text-zinc-400"
                      onClick={() => setShowAllocation(!showAllocation)}
                    >
                      Allocation{" "}
                      {showAllocation ? (
                        <ChevronUp className="ml-2 h-4 w-4" />
                      ) : (
                        <ChevronDown className="ml-2 h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {activeTab === "wallet" ? (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800">
                        <TableHead>Asset</TableHead>
                        <TableHead>Address</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Value (USD)</TableHead>
                        <TableHead>Locked?</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(showAllBalances ? walletBalances : walletBalances.slice(0, 4)).map((balance, index) => (
                        <TableRow key={index} className="border-zinc-800">
                          <TableCell>{balance.asset}</TableCell>
                          <TableCell className="font-mono">{balance.address}</TableCell>
                          <TableCell>{balance.amount}</TableCell>
                          <TableCell>{balance.value}</TableCell>
                          <TableCell>{balance.locked ? "Yes" : "No"}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="text-sm text-zinc-400 mt-2">
                    Note: "Locked" assets are held in savings and may have withdrawal restrictions.
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        Deposit Amount
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-300 transition-colors" />
                          </TooltipTrigger>
                          <TooltipContent side="right" sideOffset={5} className="bg-zinc-800 text-zinc-100 p-3 max-w-[250px]">
                            <p className="text-sm">Transfer funds from your wallet to your savings account to earn interest. Your funds will be automatically allocated to optimize returns.</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <div className="text-zinc-400">Balance: ~ ${totalBalance.toFixed(2)}</div>
                    </div>
                    <div className="flex gap-2">
                      <Input type="number" placeholder="50.00" className="bg-zinc-900 border-zinc-800" />
                      <Select>
                        <SelectTrigger className="w-[120px] bg-zinc-900 border-zinc-800">
                          <SelectValue placeholder="USDC" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="usdc">USDC</SelectItem>
                          <SelectItem value="usd">USD</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" className="bg-zinc-900 border-zinc-800">
                        Max
                      </Button>
                    </div>

                    <Button className="w-full bg-[#FDB514] hover:bg-[#FDB514]/90 text-black">Deposit to Savings</Button>
                  </div>
                </>
              ) : (
                <div className="space-y-6">
                  {showAllocation && (
                    <div className="space-y-4 bg-black mb-6">
                      <h3 className="text-lg font-semibold">Pool Distribution</h3>
                      {poolDistribution.map((pool, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-baseline justify-between">
                            <div>
                              <h4 className="font-medium">{pool.name}</h4>
                              <p className="text-sm text-zinc-400">
                                {pool.platform} • score: {pool.score.toFixed(2)}
                              </p>
                            </div>
                            <span className="text-[#00ff00] font-medium">{pool.percentage}</span>
                          </div>
                          <div className="relative h-1 bg-zinc-800 rounded-full overflow-hidden">
                            <div className="absolute top-0 left-0 h-full bg-[#FDB514]" style={{ width: "33.33%" }} />
                          </div>
                          <div className="text-sm text-zinc-400">{pool.allocation} allocation</div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-zinc-400">Allocated</span>
                            <span className="text-white">{pool.allocated}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold flex items-center gap-2">
                      Rebalance Savings
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-300 transition-colors" />
                        </TooltipTrigger>
                        <TooltipContent side="right" sideOffset={5} className="bg-zinc-800 text-zinc-100 p-3 max-w-[250px]">
                          <p className="text-sm">Automatically optimize your savings allocation across different pools based on current market conditions and risk parameters. This helps maximize your returns while maintaining your desired risk level.</p>
                        </TooltipContent>
                      </Tooltip>
                    </h3>
                    <p className="text-zinc-400">Total to rebalance: $1,000.00</p>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button className="w-full bg-[#FDB514] hover:bg-[#FDB514]/90 text-black text-lg py-6">
                          Rebalance
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Automatically adjust your savings allocation to maintain optimal returns.</p>
                      </TooltipContent>
                    </Tooltip>
                    <div className="flex items-center justify-between">
                      <span>Show Withdraw Option</span>
                      <Switch checked={showWithdraw} onCheckedChange={setShowWithdraw} />
                    </div>
                  </div>

                  {showWithdraw && (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          Withdraw Amount
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-zinc-400 hover:text-zinc-300 transition-colors" />
                            </TooltipTrigger>
                            <TooltipContent side="right" sideOffset={5} className="bg-zinc-800 text-zinc-100 p-3 max-w-[250px]">
                              <p className="text-sm">Transfer funds from your savings back to your wallet. Note that withdrawals may be subject to:</p>
                              <ul className="list-disc list-inside mt-1 text-sm text-zinc-300">
                                <li>Withdrawal fees</li>
                                <li>Minimum holding periods</li>
                                <li>Available liquidity</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                        <div className="text-zinc-400">Savings: ~ $1,000.00</div>
                      </div>
                      <div className="flex gap-2">
                        <Input type="number" placeholder="50.00" className="bg-zinc-900 border-zinc-800" />
                        <Select>
                          <SelectTrigger className="w-[120px] bg-zinc-900 border-zinc-800">
                            <SelectValue placeholder="USDC" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="usdc">USDC</SelectItem>
                            <SelectItem value="usd">USD</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="outline" className="bg-zinc-900 border-zinc-800">
                          Max
                        </Button>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <div>Slippage Tolerance</div>
                          <div>1%</div>
                        </div>
                        <Slider defaultValue={[1]} max={3} step={0.1} className="[&_[role=slider]]:bg-[#FDB514]" />
                        <div className="flex justify-between text-sm text-zinc-400 mt-1">
                          <div>0%</div>
                          <div>3%</div>
                        </div>
                      </div>

                      <Button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">Withdraw</Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

