"use client"

import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, ArrowUpDown, TrendingUp, DollarSign, LineChart, Sparkles, Info } from 'lucide-react'
import { PageLayout } from "@/components/ui/PageLayout"
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

export default function TokensPage() {
  const [activeTab, setActiveTab] = useState<'hot' | 'real'>('hot')
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)

  const metrics = [
    {
      title: "Total Market Cap",
      value: "$2.89T",
      change: "+5.67%",
      icon: DollarSign,
      trend: "up"
    },
    {
      title: "24h Volume",
      value: "$89.4B",
      change: "-2.34%",
      icon: TrendingUp,
      trend: "down"
    },
    {
      title: "Market Sentiment",
      value: "Bullish",
      change: "Fear & Greed: 75",
      icon: LineChart,
      trend: "up"
    },
    {
      title: "Altcoin Season",
      value: "85/100",
      change: "Strong Alt Season",
      icon: Sparkles,
      trend: "up"
    }
  ]

  const hotTokens = [
    {
      id: 1,
      name: "Stellar Lumens",
      symbol: "XLM",
      price: 0.12,
      change24h: 5.2,
      change7d: 8.7,
      marketCap: 3200000000,
      volume: 125000000
    },
    {
      id: 2,
      name: "Wrapped Bitcoin",
      symbol: "yBTC",
      price: 52345.67,
      change24h: 3.8,
      change7d: 12.3,
      marketCap: 980000000,
      volume: 85000000
    },
    {
      id: 3,
      name: "Wrapped Ethereum",
      symbol: "yETH",
      price: 2845.32,
      change24h: 2.5,
      change7d: 6.8,
      marketCap: 745000000,
      volume: 65000000
    },
    {
      id: 4,
      name: "Yield XLM",
      symbol: "yXLM",
      price: 0.13,
      change24h: 7.2,
      change7d: 15.4,
      marketCap: 420000000,
      volume: 45000000
    },
    {
      id: 5,
      name: "Soroban Token",
      symbol: "SBN",
      price: 2.45,
      change24h: 12.3,
      change7d: 22.1,
      marketCap: 245000000,
      volume: 28000000
    }
  ]

  const realWorldAssets = [
    {
      id: 1,
      name: "Tesla Stock",
      symbol: "xTSLA",
      price: 242.15,
      change24h: 3.2,
      change7d: 8.7,
      marketCap: 780000000,
      volume: 92000000
    },
    {
      id: 2,
      name: "S&P 500 Index",
      symbol: "xSPY",
      price: 478.32,
      change24h: 1.2,
      change7d: 3.4,
      marketCap: 650000000,
      volume: 78000000
    },
    {
      id: 3,
      name: "Gold Token",
      symbol: "xGLD",
      price: 2023.45,
      change24h: 0.8,
      change7d: 2.3,
      marketCap: 560000000,
      volume: 45000000
    },
    {
      id: 4,
      name: "Real Estate Fund",
      symbol: "xREIT",
      price: 105.67,
      change24h: 1.5,
      change7d: 4.2,
      marketCap: 340000000,
      volume: 32000000
    },
    {
      id: 5,
      name: "US Treasury Bond",
      symbol: "xBOND",
      price: 98.75,
      change24h: -0.3,
      change7d: 0.8,
      marketCap: 890000000,
      volume: 123000000
    }
  ]

  return (
    <PageLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div 
          className="space-y-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Tokens</h1>
          <p className="text-muted-foreground">Track and analyze token performance</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric, i) => (
            <motion.div
              key={metric.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="transform-gpu"
            >
              <Card className="p-6 bg-card border-border hover:shadow-md transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.title}</p>
                    <h3 className="text-2xl font-bold text-foreground mt-1">{metric.value}</h3>
                    <p className={`text-sm mt-1 ${
                      metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {metric.change}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${
                    metric.trend === 'up' ? 'bg-emerald-400/10' : 'bg-red-400/10'
                  }`}>
                    <metric.icon className={`h-5 w-5 ${
                      metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                    }`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="flex gap-2">
            <Button
              variant={activeTab === 'hot' ? 'default' : 'outline'}
              onClick={() => setActiveTab('hot')}
              className="transition-all duration-300"
            >
              Hot Tokens
            </Button>
            <Button
              variant={activeTab === 'real' ? 'default' : 'outline'}
              onClick={() => setActiveTab('real')}
              className="transition-all duration-300"
            >
              Real World Assets
            </Button>
          </div>

          <div className="flex gap-2">
            <div className="relative flex-1 md:w-[300px] group">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
              <Input
                placeholder="Search tokens..."
                className="pl-8 transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </div>
            <Select defaultValue="24h">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="24h">24H Change</SelectItem>
                <SelectItem value="7d">7D Change</SelectItem>
                <SelectItem value="30d">30D Change</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    {[
                      "Token", "Price", "24h Change", "7d Change",
                      "Market Cap", "Volume", "Actions"
                    ].map((header, i) => (
                      <TableHead 
                        key={header}
                        className="font-medium cursor-pointer hover:text-primary transition-colors duration-200"
                      >
                        <motion.div 
                          className="flex items-center gap-2"
                          whileHover={{ x: 2 }}
                        >
                          {header}
                          <ArrowUpDown className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                        </motion.div>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {(activeTab === 'hot' ? hotTokens : realWorldAssets).map((token, index) => (
                    <motion.tr
                      key={token.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      onHoverStart={() => setHoveredRow(index)}
                      onHoverEnd={() => setHoveredRow(null)}
                      className={`
                        group cursor-pointer transition-colors duration-200
                        ${hoveredRow === index ? 'bg-muted/50' : ''}
                      `}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            {token.symbol.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-medium">{token.name}</div>
                            <div className="text-sm text-muted-foreground">{token.symbol}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>${token.price.toLocaleString()}</TableCell>
                      <TableCell className={token.change24h >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {token.change24h >= 0 ? '+' : ''}{token.change24h}%
                      </TableCell>
                      <TableCell className={token.change7d >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {token.change7d >= 0 ? '+' : ''}{token.change7d}%
                      </TableCell>
                      <TableCell>${(token.marketCap / 1000000).toFixed(1)}M</TableCell>
                      <TableCell>${(token.volume / 1000000).toFixed(1)}M</TableCell>
                      <TableCell className="text-right">
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: hoveredRow === index ? 1 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                            <Info className="h-4 w-4" />
                          </Button>
                        </motion.div>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </PageLayout>
  )
}

