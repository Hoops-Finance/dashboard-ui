// caution this page is not finished. It is a work in progress.

"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import { useDataContext } from "@/contexts/DataContext";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { motion } from "framer-motion";
import { 
  Search,  
  ChevronLeft,
  ChevronRight,
  BookOpen
} from "lucide-react";
import type { AssetDetails, Token, Pair } from "@/utils/newTypes";

const PERIOD_OPTIONS = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
] as const;

export default function TokensPage() {
  const { tokens, pairs, poolRiskData, loading, fetchTokenDetails, period, setPeriod } = useDataContext();

  // Tabs: all, stablecoins, hot
  const [selectedTab, setSelectedTab] = useState<"all" | "stablecoins" | "hot">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal state for token details
  const [selectedToken, setSelectedToken] = useState<Token | null>(null);
  const [tokenDetails, setTokenDetails] = useState<AssetDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Determine if token is stablecoin: symbol includes "usd" and length ≤ 4
  const isStablecoin = (symbol: string) => {
    const sym = symbol.toLowerCase();
    return sym.includes("usd") && sym.length <= 4;
  };

  // Determine "hot" tokens:
  // Sort poolRiskData by volume (descending), take top 10 pairs by volume, find tokens in these pairs
  const hotTokens = useMemo(() => {
    if (!poolRiskData || poolRiskData.length === 0) return new Set<string>();

    const sortedByVolume = [...poolRiskData].sort((a, b) => {
      const volA = parseFloat(a.volume);
      const volB = parseFloat(b.volume);
      return volB - volA; 
    });

    const topPools = sortedByVolume.slice(0, 10);
    // topPools have pairId and protocol, we have pairs array to map pairId -> pair -> tokens
    const topTokenIds = new Set<string>();
    for (const pool of topPools) {
      const pair = pairs.find(p => p.id === pool.pairId);
      if (pair) {
        // Add token0 and token1 to hot set
        topTokenIds.add(pair.token0);
        topTokenIds.add(pair.token1);
      }
    }

    return topTokenIds;
  }, [poolRiskData, pairs]);

  // Filtering tokens based on tab
  const filteredTokens = useMemo(() => {
    return tokens.filter(token => {
      const matchesSearch =
        token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedTab === "stablecoins") {
        return isStablecoin(token.symbol);
      } else if (selectedTab === "hot") {
        return hotTokens.has(token.id);
      }

      return true; // all tab
    });
  }, [tokens, searchQuery, selectedTab, hotTokens]);

  const totalPages = Math.ceil(filteredTokens.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayedTokens = filteredTokens.slice(startIndex, startIndex + rowsPerPage);

  const handleViewDetails = async (token: Token) => {
    setSelectedToken(token);
    setDetailsLoading(true);
    setTokenDetails(null);
    setShowDialog(true);
    try {
      // We need a correct way to form asset string. 
      // If token.id has issuer info, we assume token.id as the asset.
      // If not, we must guess. If token is XLM, asset = "XLM".
      // If not XLM, maybe token.id or token.name:token.symbol. Without issuer info, we guess token.id.
      const assetId = token.id;
      const details = await fetchTokenDetails(assetId);
      setTokenDetails(details);
    } catch (error) {
      console.error("Failed to fetch token details:", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  // Find pairs that involve this token
  const getPairsForToken = (token: Token) => {
    const pairIds = token.pairs.map(tp => tp.pairId);
    const tokenPairs = pairs.filter(p => pairIds.includes(p.id));
    return tokenPairs;
  };

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

        {/* Simple Metrics Card */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6 bg-card border-border hover:shadow-md transition-all duration-300">
            <div>
              <p className="text-sm text-muted-foreground">Total Tokens Indexed</p>
              <h3 className="text-2xl font-bold text-foreground mt-1">{tokens.length}</h3>
              <p className="text-sm mt-1 text-emerald-400">---</p>
            </div>
          </Card>
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
              value={period as "24h"|"7d"|"30d"} // since period in context could be any string, cast here for the demo
              onValueChange={(value: "24h" | "7d" | "30d") => setPeriod(value)}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
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
                setPeriod('24h'); // reset period to default
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
                  <TableHead className="text-right">Last Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-10 px-4 text-center">
                      Loading tokens data...
                    </TableCell>
                  </TableRow>
                ) : displayedTokens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="h-10 px-4 text-center text-muted-foreground">
                      No tokens found
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedTokens.map((token) => (
                    <TableRow key={token.id} className="group hover:bg-muted/50">
                      <TableCell className="h-10 px-4 align-middle">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative">
                            {token.symbol.slice(0,1).toUpperCase()}
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
                      <TableCell className="h-10 px-4 align-middle text-right text-sm text-muted-foreground">
                        {new Date(token.lastUpdated).toLocaleString()}
                      </TableCell>
                      <TableCell className="h-10 px-4 align-middle text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-muted-foreground hover:text-foreground"
                          onClick={() => handleViewDetails(token)}
                        >
                          View Details
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
                  Showing {(currentPage - 1) * rowsPerPage + 1} to {Math.min((currentPage - 1) * rowsPerPage + rowsPerPage, filteredTokens.length)} of {filteredTokens.length} entries
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

      {/* Details Modal */}
      {selectedToken && (
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedToken.name} ({selectedToken.symbol}) Details</DialogTitle>
              <DialogDescription>
                {detailsLoading ? "Loading token details..." : 
                  tokenDetails ? "Detailed info from AssetDetails:" : "Failed to load details or no details available."}
              </DialogDescription>
            </DialogHeader>
            {tokenDetails && !detailsLoading && (
              <div className="space-y-4 mt-4">
                {tokenDetails.toml_info.image && (
                  <div className="flex items-center justify-start">
                    <Image
                      src={tokenDetails.toml_info.image}
                      alt={selectedToken.symbol}
                      width={48}
                      height={48}
                      className="rounded-full"
                    />
                  </div>
                )}
                <p><strong>Asset:</strong> {tokenDetails.asset}</p>
                <p><strong>Home Domain:</strong> {tokenDetails.home_domain}</p>
                <p><strong>Supply:</strong> {tokenDetails.supply.toLocaleString()}</p>
                <p><strong>Price:</strong> ${tokenDetails.price.toLocaleString(undefined, {minimumFractionDigits:2})}</p>
                <p><strong>Volume (7d):</strong> ${tokenDetails.volume7d.toLocaleString()}</p>
                <p><strong>Number of Trades:</strong> {tokenDetails.trades.toLocaleString()}</p>
                <p><strong>Rating (avg):</strong> {tokenDetails.rating.average.toFixed(2)}</p>

                <div>
                  <h3 className="font-semibold mb-2">Pairs:</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {getPairsForToken(selectedToken).map(pair => {
                      const t0 = tokens.find(t=>t.id===pair.token0);
                      const t1 = tokens.find(t=>t.id===pair.token1);
                      const pairLabel = t0 && t1 ? `${t0.symbol}/${t1.symbol}` : pair.id;
                      const proto = pair.protocol.toLowerCase();
                      const pairUrl = `/pools/${proto}/${pairLabel.replace('/','-')}`;
                      return (
                        <li key={pair.id}>
                          <a href={pairUrl} className="text-primary hover:underline">{pairLabel}</a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
