"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Info, Search, Settings2, Bot, Plus } from 'lucide-react'
import { PageLayout } from "@/components/ui/PageLayout"
import { motion, AnimatePresence } from 'framer-motion'
import Link from "next/link"

interface Strategy {
  id: string;
  name: string;
  tokens: { symbol: string; }[];
  totalValue: string;
  feesGenerated: string;
  age: string;
  apr: string;
  isAutomated?: boolean;
}

export default function StrategiesPage() {
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
          <h1 className="text-2xl font-bold text-foreground">Strategies</h1>
          <p className="text-muted-foreground">Optimize your DeFi investment strategies</p>
        </motion.div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "AUM", value: "$11.8M" },
            { label: "Volume", value: "$376.5M" },
            { label: "Fees Generated", value: "$7.6M" }
          ].map((metric, i) => (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="p-4 bg-card border-border hover:shadow-md transition-all duration-300">
                <div className="text-sm text-muted-foreground">{metric.label}</div>
                <div className="text-2xl font-bold text-foreground">{metric.value}</div>
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
          <Tabs defaultValue="best-apr" className="w-full md:w-auto">
            <TabsList className="grid grid-cols-4 w-full md:w-auto">
              {["Best APR", "Automated", "High Cap", "Stable"].map((tab) => (
                <TabsTrigger 
                  key={tab.toLowerCase().replace(" ", "-")} 
                  value={tab.toLowerCase().replace(" ", "-")}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-200"
                >
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex gap-2">
            <div className="relative flex-1 md:w-[300px] group">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
              <Input
                placeholder="Search by token/pair/address"
                className="pl-8 transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button 
              variant="outline" 
              size="icon"
              className="hover:bg-primary/10 transition-all duration-200"
            >
              <Settings2 className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>

        <AnimatePresence>
          <motion.div 
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {strategies.map((strategy, index) => (
              <motion.div
                key={strategy.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                className="transform-gpu"
              >
                <Card className="p-4 bg-card border-border hover:shadow-md transition-all duration-300">
                  <div className="grid gap-4 md:grid-cols-7">
                    <div className="flex items-center gap-3 md:col-span-2">
                      <div className="flex -space-x-2">
                        {strategy.tokens.map((token, i) => (
                          <motion.div
                            key={i}
                            className="h-8 w-8 rounded-full bg-muted flex items-center justify-center ring-2 ring-background"
                            whileHover={{ scale: 1.1, zIndex: 1 }}
                          >
                            {token.symbol}
                          </motion.div>
                        ))}
                      </div>
                      <div>
                        <div className="font-medium text-foreground flex items-center gap-2">
                          {strategy.name}
                          {strategy.isAutomated && (
                            <Bot className="h-4 w-4 text-primary" />
                          )}
                        </div>
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
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="hover:bg-primary/10 transition-all duration-200"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button className="hover:bg-primary/90 transition-colors duration-200">
                        Deploy
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}

            <Link href="/strategies/create">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="p-8 border-dashed border-2 hover:border-primary/50 hover:bg-muted/50 transition-all duration-300 flex flex-col items-center justify-center gap-3 cursor-pointer group">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center group-hover:bg-background transition-colors duration-300">
                    <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                  </div>
                  <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors duration-300">
                    Create New Strategy
                  </p>
                </Card>
              </motion.div>
            </Link>
          </motion.div>
        </AnimatePresence>

        <motion.div 
          className="fixed bottom-4 right-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1 }}
        >
          <div className="bg-card text-card-foreground px-3 py-1.5 rounded-full text-sm font-medium border border-border hover:border-primary/50 transition-all duration-300">
            Pro Feature
          </div>
        </motion.div>
      </motion.div>
    </PageLayout>
  )
}

const strategies: Strategy[] = [
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

