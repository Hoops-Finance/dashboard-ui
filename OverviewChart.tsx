"use client"

import { useState } from "react"
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from "recharts"

type PieData = {
  name: string
  value: number
  color: string
  amount: string
}

type OverviewChartProps = {
  activeTab: string
  walletPieData: PieData[]
  savingsPieData: PieData[]
}

export default function OverviewChart({ activeTab, walletPieData, savingsPieData }: OverviewChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-zinc-800 border border-zinc-700 p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-xl font-semibold mb-2">{data.name}</h3>
            <p className="text-2xl font-bold text-[#00ff00]">${data.value.toFixed(2)}</p>
            <p className="text-zinc-400 text-sm mt-2">{((data.value / data.total) * 100).toFixed(2)}% of total</p>
            <p className="text-white text-lg mt-4">
              Amount: {data.amount} {data.name.split("/")[0]}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
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
              total={(activeTab === "wallet" ? walletPieData : savingsPieData).reduce(
                (sum, item) => sum + item.value,
                0,
              )}
            />
          ))}
        </Pie>
        {activeIndex !== null && <RechartsTooltip content={<CustomTooltip />} />}
      </PieChart>
    </div>
  )
}

