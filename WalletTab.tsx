"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"

type WalletBalance = {
  asset: string
  address: string
  amount: string
  value: string
  locked: boolean
}

type WalletTabProps = {
  walletBalances: WalletBalance[]
  totalBalance: number
}

export default function WalletTab({ walletBalances, totalBalance }: WalletTabProps) {
  const [showAllBalances, setShowAllBalances] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex justify-between items-center w-full">
        <h2 className="text-3xl font-semibold">~ {totalBalance.toFixed(2)} USD</h2>
        <Button variant="ghost" className="text-zinc-400" onClick={() => setShowAllBalances(!showAllBalances)}>
          All Balances{" "}
          {showAllBalances ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow className="border-zinc-800">
            <TableHead>Asset</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Value (USD)</TableHead>
            <TableHead>Locked?</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(showAllBalances ? walletBalances : walletBalances.slice(0, 4)).map((balance, index) => (
            <TableRow key={index} className="border-zinc-800">
              <TableCell>{balance.asset}</TableCell>
              <TableCell className="font-mono">{balance.address}</TableCell>
              <TableCell>{balance.amount}</TableCell>
              <TableCell>{balance.value}</TableCell>
              <TableCell>{balance.locked ? "Yes" : "No"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="text-sm text-zinc-400 mt-2">
        Note: "Locked" assets are held in savings and may have withdrawal restrictions.
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            Deposit Amount
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-zinc-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Transfer funds from your wallet to your savings account to earn interest.</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="text-zinc-400">Balance: ~ ${totalBalance.toFixed(2)}</div>
        </div>
        <div className="flex gap-2">
          <Input type="number" placeholder="50.00" className="bg-zinc-900 border-zinc-800" />
          <Select>
            <SelectTrigger className="w-[120px] bg-zinc-900 border-zinc-800">
              <SelectValue placeholder="USDC" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usdc">USDC</SelectItem>
              <SelectItem value="usd">USD</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" className="bg-zinc-900 border-zinc-800">
            Max
          </Button>
        </div>

        <Button className="w-full bg-[#FDB514] hover:bg-[#FDB514]/90 text-black">Deposit to Savings</Button>
      </div>
    </TooltipProvider>
  )
}

