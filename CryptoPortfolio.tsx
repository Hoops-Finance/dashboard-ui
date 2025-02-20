"use client"

import { useState } from "react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TooltipProvider } from "@/components/ui/tooltip"
import StatsCards from "./StatsCards"
import OverviewChart from "./OverviewChart"
import WalletTab from "./WalletTab"
import SavingsTab from "./SavingsTab"

export default function CryptoPortfolio() {
  const [activeTab, setActiveTab] = useState("wallet")

  const walletPieData = [
    { name: "XLM", value: 69.14, color: "#FDB514", amount: "10,455.4" },
    { name: "AQUA", value: 10.04, color: "#9333EA", amount: "645.44" },
    { name: "BTC", value: 92.0, color: "#F97316", amount: "0.0023" },
    { name: "ETH", value: 339.91, color: "#3B82F6", amount: "0.15" },
    { name: "USDC (Checking)", value: 100.0, color: "#10B981", amount: "100" },
    { name: "Savings", value: 14.2, color: "#6366F1", amount: "14.2" },
  ]

  const savingsPieData = [
    { name: "EURC/GBPC", value: 333.33, color: "#FDB514", amount: "333.33" },
    { name: "EURC/EURC", value: 333.33, color: "#9333EA", amount: "333.33" },
    { name: "USDC/XTAR", value: 333.33, color: "#F97316", amount: "333.33" },
  ]

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

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-black text-white p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <StatsCards totalBalance={totalBalance} />

          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-lg font-semibold mb-4">Overview</h2>
              <OverviewChart activeTab={activeTab} walletPieData={walletPieData} savingsPieData={savingsPieData} />
            </div>

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
              </div>

              {activeTab === "wallet" ? (
                <WalletTab walletBalances={walletBalances} totalBalance={totalBalance} />
              ) : (
                <SavingsTab poolDistribution={poolDistribution} />
              )}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}

