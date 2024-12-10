"use client"

import React, { useEffect, useState } from "react";
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
import { motion } from "framer-motion";
import { 
  Search, 
  X, 
  ExternalLink,
  DollarSign,
  TrendingUp,
  LineChart,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  BookOpen
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
    <div className="relative">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Title Section */}
        <motion.div 
          className="space-y-0.5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
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
              transition={{ duration: 0.3, delay: i * 0.1 }}
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

        {/* Table Controls */}
        <motion.div 
          className="flex flex-col gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <Button 
                variant={selectedTab === "all" ? "default" : "secondary"}
                onClick={() => setSelectedTab("all")}
                className="h-9"
              >
                All Tokens
              </Button>
              <Button 
                variant={selectedTab === "stablecoins" ? "default" : "secondary"}
                onClick={() => setSelectedTab("stablecoins")}
                className="h-9"
              >
                Stablecoins
              </Button>
              <Button 
                variant={selectedTab === "hot" ? "default" : "secondary"}
                onClick={() => setSelectedTab("hot")}
                className="h-9"
              >
                Hot Tokens
              </Button>
            </div>
            <Button 
              variant="outline" 
              className="h-9 gap-2"
              onClick={() => window.open('https://api.hoops.finance', '_blank')}
            >
              <BookOpen className="h-4 w-4" />
              Read the docs
            </Button>
          </div>

          <div className="flex items-center gap-4">
            <Select 
              value={selectedPeriod} 
              onValueChange={(value: "24h" | "7d" | "30d") => setSelectedPeriod(value)}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(period => (
                  <SelectItem key={period.value} value={period.value}>
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by token name or symbol" 
                className="pl-10 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button 
              variant="secondary" 
              className="h-9"
              onClick={() => {
                setSearchQuery('');
                setSelectedPeriod('24h');
                setSelectedTab('all');
              }}
            >
              Reset
            </Button>
          </div>
        </motion.div>

        {/* Tokens Table */}
        <motion.div 
          className="rounded-lg border bg-card text-card-foreground shadow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="relative w-full overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Token</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">{selectedPeriod.toUpperCase()} Change</TableHead>
                  <TableHead className="text-right">Market Cap</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-10 px-4 text-center">
                      Loading tokens data...
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-10 px-4 text-center text-red-500">
                      {error}
                    </TableCell>
                  </TableRow>
                ) : displayedTokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-10 px-4 text-center text-muted-foreground">
                      No tokens found
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedTokens.map((token) => (
                    <TableRow key={token.id} className="group hover:bg-muted/50">
                      <TableCell className="h-10 px-4 align-middle">
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
                      <TableCell className="h-10 px-4 align-middle text-right">
                        ${token.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
                      </TableCell>
                      <TableCell className={`h-10 px-4 align-middle text-right ${
                        getChangeValue(token, selectedPeriod) >= 0 ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {getChangeValue(token, selectedPeriod) >= 0 ? '+' : ''}
                        {getChangeValue(token, selectedPeriod).toFixed(2)}%
                      </TableCell>
                      <TableCell className="h-10 px-4 align-middle text-right">
                        ${(token.marketCap / 1000000).toFixed(1)}M
                      </TableCell>
                      <TableCell className="h-10 px-4 align-middle text-right">
                        ${(token.volume / 1000000).toFixed(1)}M
                      </TableCell>
                      <TableCell className="h-10 px-4 align-middle text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-muted-foreground hover:text-foreground"
                        >
                          View Details
                          <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Table Footer with Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
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
                  className="h-8"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2 text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

