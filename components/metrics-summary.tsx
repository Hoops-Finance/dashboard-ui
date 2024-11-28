"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function MetricsSummary() {
  const [selectedPeriod, setSelectedPeriod] = useState("1d")

  const profitData = {
    "1d": 100,
    "1w": 750,
    "1m": 3000,
    "1y": 15000,
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-6">Balance Summary</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Savings Balance:</span>
            <span className="font-semibold">$10,000</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Wallet Balance:</span>
            <span className="font-semibold">$5,000</span>
          </div>
          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-muted-foreground">Total Balance:</span>
            <span className="font-semibold">$15,000</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-semibold">Profit</h2>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">24H</SelectItem>
              <SelectItem value="1w">7D</SelectItem>
              <SelectItem value="1m">30D</SelectItem>
              <SelectItem value="1y">1Y</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <div className="text-4xl font-bold text-green-500">
            +${profitData[selectedPeriod as keyof typeof profitData].toLocaleString()}
          </div>
          <div className="text-sm text-muted-foreground">
            Total profit for selected period
          </div>
        </div>
      </Card>
    </div>
  )
}

