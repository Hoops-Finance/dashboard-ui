"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Plus } from 'lucide-react'
import { cn } from "@/lib/utils"
import Link from "next/link"

interface Strategy {
  id: string;
  name: string;
  tokens: Array<{ symbol: string }>;
  apr: string;
  totalValue: string;
  description: string;
  riskLevel?: 'Low' | 'Medium' | 'High';
}


const strategies: Strategy[] = [
  {
    id: "8608556",
    name: "XLM/USDC Yield",
    tokens: [{ symbol: "🌟" }, { symbol: "💎" }],
    apr: "10,872.27%",
    totalValue: "$317.75",
    description: "High-yield liquidity provision strategy for XLM/USDC pair",
    riskLevel: 'Low'
  },
  {
    id: "8932821",
    name: "Stable Yield",
    tokens: [{ symbol: "💫" }, { symbol: "💰" }],
    apr: "10,706.23%",
    totalValue: "$534.63",
    description: "Conservative yield farming with stablecoin pairs",
    riskLevel: 'Medium'
  },
  {
    id: "9005358",
    name: "Blue Chip Mix",
    tokens: [{ symbol: "🌟" }, { symbol: "💎" }],
    apr: "10,257.25%",
    totalValue: "$196.14",
    description: "Diversified portfolio of blue-chip crypto assets",
    riskLevel: 'Medium'
  }
]

export function StrategiesSidebar() {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getRiskColor = (level: Strategy['riskLevel']) => {
    switch (level) {
      case 'Low': return 'text-emerald-400'
      case 'Medium': return 'text-yellow-400'
      case 'High': return 'text-red-400'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className="py-4 space-y-3">
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
            <div className="card-content-base">
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
                  <h3 className="font-medium">{strategy.name}</h3>
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
              <div className="mt-4 pt-4 border-t space-y-3">
                <p className="text-sm text-muted-foreground">{strategy.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">APR</div>
                    <div className="font-medium text-green-500">{strategy.apr}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Total Value</div>
                    <div className="font-medium">{strategy.totalValue}</div>
                  </div>
                </div>
                <Button className="w-full" variant="outline">Analyze Strategy</Button>
              </div>
            )}
          </div>
        </Card>
      ))}

      <Link href="/strategies/create">
        <Card className="p-6 border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer group">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-background transition-colors duration-300">
            <Plus className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
          </div>
          <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
            Add Strategy
          </p>
        </Card>
      </Link>
    </div>
  )
}

