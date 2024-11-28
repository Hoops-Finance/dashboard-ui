"use client"

import { PageLayout } from "@/components/ui/PageLayout"
import { Card } from "@/components/ui/card"
import { TradingViewChart } from "@/components/TradingViewChart"
import { useState } from "react"
import { ChevronDown, ChevronUp, Bot } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const metrics = [
  { label: "Total Value", value: "$12.7M", change: "+12.5%" },
  { label: "24h Volume", value: "$1.2M", change: "-5.2%" },
  { label: "Active Strategies", value: "3", change: "+1" },
  { label: "Total Profit", value: "$234.5K", change: "+18.3%" }
]

interface Pool {
  pair: string
  distribution: number
  apr: string
}

interface Strategy {
  id: string
  name: string
  tokens: Array<{ symbol: string }>
  apr: string
  totalValue: string
  description: string
  isAutomated?: boolean
  pools: Pool[]
  riskLevel: 'Low' | 'Medium' | 'High'
}

const strategies: Strategy[] = [
  {
    id: "8608556",
    name: "Universal Savings",
    tokens: [{ symbol: "💰" }, { symbol: "🔒" }],
    apr: "12.45%",
    totalValue: "$1.2M",
    description: "A fully automated strategy focused on stable returns through diversified stablecoin pools",
    isAutomated: true,
    riskLevel: 'Low',
    pools: [
      { pair: "USDC/USDT", distribution: 40, apr: "8.5%" },
      { pair: "DAI/USDC", distribution: 35, apr: "7.2%" },
      { pair: "USDT/DAI", distribution: 25, apr: "6.8%" }
    ]
  },
  {
    id: "8932821",
    name: "Ecosystem Value",
    tokens: [{ symbol: "🌟" }, { symbol: "💎" }],
    apr: "28.67%",
    totalValue: "$834.5K",
    description: "Focus on core ecosystem tokens with proven track records",
    riskLevel: 'Medium',
    pools: [
      { pair: "XLM/USDC", distribution: 45, apr: "32.4%" },
      { pair: "ETH/USDC", distribution: 35, apr: "24.8%" },
      { pair: "BTC/USDC", distribution: 20, apr: "18.5%" }
    ]
  },
  {
    id: "9005358",
    name: "New Projects",
    tokens: [{ symbol: "🚀" }, { symbol: "💫" }],
    apr: "45.88%",
    totalValue: "$425.2K",
    description: "Higher risk-reward ratio focusing on new promising projects",
    riskLevel: 'High',
    pools: [
      { pair: "yXLM/XLM", distribution: 40, apr: "52.3%" },
      { pair: "yUSDC/USDC", distribution: 35, apr: "42.7%" },
      { pair: "yETH/ETH", distribution: 25, apr: "38.4%" }
    ]
  }
]

export default function PortfolioPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const getRiskColor = (level: Strategy['riskLevel']) => {
    switch (level) {
      case 'Low': return 'text-emerald-400'
      case 'Medium': return 'text-yellow-400'
      case 'High': return 'text-red-400'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Portfolio Overview</h1>
          <p className="text-muted-foreground">Track your DeFi investments and performance</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((metric, i) => (
            <Card key={i} className="p-4 bg-card border-border">
              <div className="text-sm text-muted-foreground">{metric.label}</div>
              <div className="text-2xl font-bold text-foreground mt-1">{metric.value}</div>
              <div className={`text-sm mt-1 ${
                metric.change.startsWith('+') 
                  ? 'text-emerald-400' 
                  : metric.change.startsWith('-') 
                    ? 'text-red-400' 
                    : 'text-muted-foreground'
              }`}>
                {metric.change}
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-4 bg-card border-border">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">Performance Chart</h2>
                <p className="text-sm text-muted-foreground">Portfolio value over time</p>
              </div>
              <TradingViewChart />
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="p-4 bg-card border-border h-full">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-foreground">Active Strategies</h2>
                <p className="text-sm text-muted-foreground">Currently running strategies</p>
              </div>
              <div className="space-y-4">
                {strategies.map((strategy) => (
                  <Card
                    key={strategy.id}
                    className={cn(
                      "transition-all duration-200 hover:bg-muted/50 cursor-pointer",
                      expandedId === strategy.id && "bg-muted/50"
                    )}
                    onClick={() => setExpandedId(expandedId === strategy.id ? null : strategy.id)}
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex -space-x-2">
                            {strategy.tokens.map((token, i) => (
                              <div
                                key={i}
                                className="h-8 w-8 rounded-full bg-background flex items-center justify-center ring-2 ring-muted"
                              >
                                {token.symbol}
                              </div>
                            ))}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{strategy.name}</h3>
                              {strategy.isAutomated && (
                                <Bot className="h-4 w-4 text-primary" title="Fully Automated" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">Strategy #{strategy.id}</p>
                          </div>
                        </div>
                        {expandedId === strategy.id ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      
                      {expandedId === strategy.id && (
                        <div className="mt-4 pt-4 border-t space-y-4">
                          <p className="text-sm text-muted-foreground">{strategy.description}</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Risk Level</span>
                              <span className={getRiskColor(strategy.riskLevel)}>{strategy.riskLevel}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Total Value</span>
                              <span className="font-medium">{strategy.totalValue}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Average APR</span>
                              <span className="text-emerald-400">{strategy.apr}</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <h4 className="text-sm font-medium">Pool Distribution</h4>
                            {strategy.pools.map((pool, index) => (
                              <div key={index} className="bg-background rounded-lg p-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-foreground">{pool.pair}</span>
                                  <span className="text-emerald-400">{pool.apr}</span>
                                </div>
                                <div className="mt-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-primary"
                                    style={{ width: `${pool.distribution}%` }}
                                  />
                                </div>
                                <div className="text-xs text-muted-foreground mt-1">
                                  {pool.distribution}% allocation
                                </div>
                              </div>
                            ))}
                          </div>

                          <Button className="w-full" variant="outline">
                            Analyze Strategy
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

