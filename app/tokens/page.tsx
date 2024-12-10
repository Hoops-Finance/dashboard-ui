"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PageLayout } from "@/components/ui/PageLayout";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  X, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  LineChart,
  Sparkles
} from "lucide-react";

const PERIOD_OPTIONS = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
] as const;

// Metrics data
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
];

type TokenType = {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  change7d: number;
  change30d: number;
  marketCap: number;
  volume: number;
  image?: string;
};

export default function TokensPage() {
  const [selectedPeriod, setSelectedPeriod] = useState<"24h" | "7d" | "30d">("24h");
  const [selectedTab, setSelectedTab] = useState<"all" | "stablecoins" | "hot">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [tokens, setTokens] = useState<TokenType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('https://api.hoops.finance/tokens', {
          headers: {
            'accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tokens');
        }

        const data = await response.json();
        
        // Transform API data to match our TokenType
        const transformedData: TokenType[] = data.map((token: any) => ({
          id: token.id || token.symbol,
          name: token.name,
          symbol: token.symbol,
          price: Number(token.price) || 0,
          change24h: Number(token.price_change_24h) || 0,
          change7d: Number(token.price_change_7d) || 0,
          change30d: Number(token.price_change_30d) || 0,
          marketCap: Number(token.market_cap) || 0,
          volume: Number(token.volume_24h) || 0,
          image: token.image
        }));

        setTokens(transformedData);
      } catch (err) {
        console.error('Error fetching tokens:', err);
        setError(err instanceof Error ? err.message : 'Failed to load tokens');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTokens();
  }, []);

  const getChangeValue = (token: TokenType, period: typeof selectedPeriod) => {
    switch (period) {
      case "24h": return token.change24h;
      case "7d": return token.change7d;
      case "30d": return token.change30d;
      default: return token.change24h;
    }
  };

  const filteredTokens = tokens.filter(token => {
    const matchesSearch = 
      token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = selectedTab === "all" || 
      (selectedTab === "stablecoins" && token.symbol.toLowerCase().includes("usd")) ||
      (selectedTab === "hot" && Math.abs(token.change24h) > 5); // Example criteria for "hot" tokens
    
    return matchesSearch && matchesTab;
  });

  const totalPages = Math.ceil(filteredTokens.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedTokens = filteredTokens.slice(startIndex, startIndex + rowsPerPage);

  return (
    <PageLayout>
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Title Section */}
        <motion.div 
          className="space-y-1"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Tokens</h1>
          <p className="text-muted-foreground">Track and analyze token performance</p>
        </motion.div>

        {/* Metrics Grid */}
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

        {/* Tokens Table Card */}
        <Card className="border-none shadow-md">
          <CardHeader className="pb-2 space-y-4">
            {/* Token Type Selection and Docs Button */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={selectedTab === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTab("all")}
                >
                  All Tokens
                </Button>
                <Button
                  variant={selectedTab === "stablecoins" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTab("stablecoins")}
                >
                  Stablecoins
                </Button>
                <Button
                  variant={selectedTab === "hot" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTab("hot")}
                >
                  Hot Tokens
                </Button>
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Read the Docs
              </Button>
            </div>

            {/* Search and Filter Controls */}
            <div className="flex items-center gap-4">
              <Select value={selectedPeriod} onValueChange={(value: typeof selectedPeriod) => setSelectedPeriod(value)}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Period" />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tokens..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPeriod("24h");
                  setSelectedTab("all");
                  setCurrentPage(1);
                }}
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-muted-foreground">Loading tokens...</div>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-destructive">
                {error}
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">{selectedPeriod.toUpperCase()} Change</TableHead>
                      <TableHead className="text-right">Market Cap</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedTokens.map((token) => (
                      <TableRow key={token.id}>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {token.image ? (
                                <img 
                                  src={token.image} 
                                  alt={token.symbol}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                token.symbol.slice(0, 1)
                              )}
                            </div>
                            <div>
                              <div className="font-medium">{token.name}</div>
                              <div className="text-sm text-muted-foreground">{token.symbol}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                        </TableCell>
                        <TableCell className={`text-right ${getChangeValue(token, selectedPeriod) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {getChangeValue(token, selectedPeriod) >= 0 ? '+' : ''}{getChangeValue(token, selectedPeriod).toFixed(2)}%
                        </TableCell>
                        <TableCell className="text-right">
                          ${(token.marketCap / 1000000).toFixed(1)}M
                        </TableCell>
                        <TableCell className="text-right">
                          ${(token.volume / 1000000).toFixed(1)}M
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">
                            View Pools
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Updated Pagination Section */}
                <div className="flex items-center justify-between px-2 py-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Show</span>
                      <Select
                        value={rowsPerPage.toString()}
                        onValueChange={(value) => {
                          setRowsPerPage(Number(value));
                          setCurrentPage(1);
                        }}
                      >
                        <SelectTrigger className="w-[70px] h-8">
                          <SelectValue placeholder="10" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="10">10</SelectItem>
                          <SelectItem value="25">25</SelectItem>
                          <SelectItem value="50">50</SelectItem>
                          <SelectItem value="100">100</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm text-muted-foreground">entries</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredTokens.length)} of {filteredTokens.length} entries
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}

