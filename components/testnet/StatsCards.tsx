import { Card } from "@/components/ui/card"

type StatsCardsProps = {
  totalBalance: number
}

export default function StatsCards({ totalBalance }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <div className="text-sm text-zinc-400">Total Balance</div>
        <div className="text-xl font-semibold mt-1 text-white">${totalBalance.toFixed(2)}</div>
        <div className="text-sm text-emerald-500">+ 20%</div>
      </Card>
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <div className="text-sm text-zinc-400">Checking</div>
        <div className="text-xl font-semibold mt-1 text-white">100 USDC</div>
        <div className="text-sm text-emerald-500">+ 20%</div>
      </Card>
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <div className="text-sm text-zinc-400">Savings</div>
        <div className="text-xl font-semibold mt-1 text-white">14.2 USD</div>
        <div className="text-sm text-emerald-500">+ 20%</div>
      </Card>
      <Card className="bg-zinc-900 border-zinc-800 p-4">
        <div className="text-sm text-zinc-400">APY</div>
        <div className="text-xl font-semibold mt-1 text-white">2.3%</div>
        <div className="text-sm text-emerald-500">+ 20%</div>
      </Card>
    </div>
  )
}

