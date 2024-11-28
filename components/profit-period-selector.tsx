"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProfitPeriodSelector() {
  const [selectedPeriod, setSelectedPeriod] = useState("1d")

  // TODO: Replace with actual data fetching logic
  const profitData = {
    "1d": 100,
    "1w": 750,
    "1m": 3000,
    "1y": 15000,
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profit</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">1 Day</SelectItem>
            <SelectItem value="1w">1 Week</SelectItem>
            <SelectItem value="1m">1 Month</SelectItem>
            <SelectItem value="1y">1 Year</SelectItem>
          </SelectContent>
        </Select>
        <div className="mt-4 text-2xl font-bold">
          ${profitData[selectedPeriod as keyof typeof profitData].toLocaleString()}
        </div>
      </CardContent>
    </Card>
  )
}

