"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Plus, Search } from 'lucide-react'
import { cn } from "@/lib/utils"

interface Playlist {
  id: number
  name: string
  icon: string
  description: string
  apr: number
  totalValue: number
  profit: number
  pools: Array<{
    name: string
    allocation: number
    apr: number
  }>
}

const playlists: Playlist[] = [
  {
    id: 1,
    name: "Hoops Savings",
    icon: "💰",
    description: "Stable yield farming strategy",
    apr: 5.2,
    totalValue: 10000,
    profit: 520,
    pools: [
      { name: "USDC/USDT", allocation: 40, apr: 4.8 },
      { name: "XLM/USDC", allocation: 60, apr: 5.5 }
    ]
  },
  {
    id: 2,
    name: "Hot Pools",
    icon: "🔥",
    description: "High APR liquidity pools",
    apr: 12.5,
    totalValue: 5000,
    profit: 625,
    pools: [
      { name: "yXLM/XLM", allocation: 50, apr: 15.2 },
      { name: "yBTC/XLM", allocation: 50, apr: 9.8 }
    ]
  },
  {
    id: 3,
    name: "Stable Income",
    icon: "🏦",
    description: "Conservative yield strategy",
    apr: 3.8,
    totalValue: 15000,
    profit: 570,
    pools: [
      { name: "USDC/USDT", allocation: 70, apr: 3.5 },
      { name: "yUSDC/USDC", allocation: 30, apr: 4.5 }
    ]
  },
  {
    id: 4,
    name: "Blue Chip Mix",
    icon: "💎",
    description: "Major assets yield farming",
    apr: 7.2,
    totalValue: 8000,
    profit: 576,
    pools: [
      { name: "BTC/USDC", allocation: 40, apr: 6.8 },
      { name: "ETH/USDC", allocation: 40, apr: 7.4 },
      { name: "XLM/USDC", allocation: 20, apr: 7.6 }
    ]
  }
]

export default function FinancialPlaylistList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const filteredPlaylists = playlists.filter((playlist) =>
    playlist.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card className="h-full bg-background">
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Playlists</h2>
          <Button size="sm" variant="outline" className="gap-2">
            <Plus className="h-4 w-4" /> Create
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search playlists"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="space-y-2">
          {filteredPlaylists.map((playlist) => (
            <Card
              key={playlist.id}
              className={cn(
                "transition-all duration-200 hover:bg-muted/50 cursor-pointer",
                expandedId === playlist.id && "bg-muted/50"
              )}
              onClick={() => setExpandedId(expandedId === playlist.id ? null : playlist.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{playlist.icon}</div>
                    <div>
                      <h3 className="font-semibold">{playlist.name}</h3>
                      <p className="text-sm text-muted-foreground">{playlist.description}</p>
                    </div>
                  </div>
                  {expandedId === playlist.id ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                
                {expandedId === playlist.id && (
                  <div className="mt-4 pt-4 border-t space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">APR</div>
                        <div className="font-semibold text-green-500">{playlist.apr}%</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Total Value</div>
                        <div className="font-semibold">${playlist.totalValue.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Profit</div>
                        <div className="font-semibold text-green-500">+${playlist.profit.toLocaleString()}</div>
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">Pools</div>
                      <div className="space-y-2">
                        {playlist.pools.map((pool, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span>{pool.name}</span>
                            <div className="flex items-center gap-4">
                              <span className="text-muted-foreground">{pool.allocation}%</span>
                              <span className="text-green-500">{pool.apr}% APR</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </Card>
  )
}

