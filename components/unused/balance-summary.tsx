import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function BalanceSummary() {
  // TODO: Replace with actual data fetching logic
  const savingsBalance = 10000
  const walletBalance = 5000

  return (
    <Card>
      <CardHeader>
        <CardTitle>Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Savings Balance:</span>
            <span className="font-semibold">${savingsBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Wallet Balance:</span>
            <span className="font-semibold">${walletBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-2 border-t">
            <span>Total Balance:</span>
            <span className="font-semibold">${(savingsBalance + walletBalance).toLocaleString()}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

