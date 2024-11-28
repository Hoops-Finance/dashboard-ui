import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const tokens = [
  {
    name: "XLM",
    icon: "🌟",
    price: "$0.12",
    change: "2.84%",
    isPositive: true,
  },
  {
    name: "yXLM",
    icon: "💫",
    price: "$0.13",
    change: "-4.58%",
    isPositive: false,
  },
  {
    name: "yUSDC",
    icon: "💎",
    price: "$1.00",
    change: "0%",
    isPositive: true,
  },
]

export function TokensTable() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Top Tokens</h2>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select DEX" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All DEXes</SelectItem>
            <SelectItem value="aquarius">Aquarius</SelectItem>
            <SelectItem value="soroswap">Soroswap</SelectItem>
            <SelectItem value="phoenix">Phoenix</SelectItem>
            <SelectItem value="blend">Blend</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-medium">Tokens</TableHead>
              <TableHead className="font-medium">Price</TableHead>
              <TableHead className="font-medium">24h Change</TableHead>
              <TableHead className="font-medium text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.name} className="hover:bg-muted/50">
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <span>{token.icon}</span>
                    <span>{token.name}</span>
                  </div>
                </TableCell>
                <TableCell>{token.price}</TableCell>
                <TableCell className={token.isPositive ? "text-green-500" : "text-red-500"}>
                  {token.change}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-600 hover:bg-green-100">
                    Trade
                  </Button>
                  <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-600 hover:bg-green-100">
                    Add Liquidity
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

