"use client"

import { PageLayout } from "@/components/ui/PageLayout"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function CreateStrategyPage() {
  const router = useRouter();

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Create New Strategy</h1>
          <p className="text-muted-foreground">Configure your automated DeFi strategy</p>
        </div>

        <Card className="p-6">
          <form className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Strategy Name</label>
                <Input placeholder="Enter strategy name" className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Token Pair</label>
                <div className="grid grid-cols-2 gap-4 mt-1">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlm">XLM</SelectItem>
                      <SelectItem value="usdc">USDC</SelectItem>
                      <SelectItem value="eth">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select token" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xlm">XLM</SelectItem>
                      <SelectItem value="usdc">USDC</SelectItem>
                      <SelectItem value="eth">ETH</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Strategy Type</label>
                <Select>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select strategy type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="yield">Yield Farming</SelectItem>
                    <SelectItem value="arbitrage">Arbitrage</SelectItem>
                    <SelectItem value="liquidity">Liquidity Provision</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Initial Investment</label>
                <Input type="number" placeholder="Enter amount" className="mt-1" />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground">Target APR</label>
                <Input type="number" placeholder="Enter target APR %" className="mt-1" />
              </div>
            </div>

            <div className="flex justify-end gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => router.push("/strategies")}
              >
                Cancel
              </Button>
              <Button>Create Strategy</Button>
            </div>
          </form>
        </Card>
      </div>
    </PageLayout>
  )
}

