"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

type PoolDistribution = {
  name: string
  percentage: string
  platform: string
  score: number
  allocation: string
  allocated: string
}

type SavingsTabProps = {
  poolDistribution: PoolDistribution[]
}

export default function SavingsTab({ poolDistribution }: SavingsTabProps) {
  const [showAllocation, setShowAllocation] = useState(false)
  const [showWithdraw, setShowWithdraw] = useState(false)

  return (
    <TooltipProvider>
      <div className="space-y-6">
        <div className="flex justify-between items-center w-full">
          <h2 className="text-3xl font-semibold">~ 1,000.00 USD</h2>
          <Button variant="ghost" className="text-zinc-400" onClick={() => setShowAllocation(!showAllocation)}>
            Allocation{" "}
            {showAllocation ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
          </Button>
        </div>

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
          <h3 className="text-xl font-semibold">Rebalance Savings</h3>
          <p className="text-zinc-400">Total to rebalance: $1,000.00</p>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button className="w-full bg-[#FDB514] hover:bg-[#FDB514]/90 text-black text-lg py-6">Rebalance</Button>
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
                    <Info className="h-4 w-4 text-zinc-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Transfer funds from your savings back to your wallet. May be subject to withdrawal fees.</p>
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
    </TooltipProvider>
  )
}

