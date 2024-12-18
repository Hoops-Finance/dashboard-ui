"use client";

import React, { useState, useMemo } from "react";
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
import { motion } from "framer-motion";
import { Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import type { Token } from "@/utils/newTypes";
import { TopPools } from "@/components/TopPools";

const STABLECOIN_IDS = new Set<string>([
  "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
  "CDIKURWHYS4FFTR5KOQK6MBFZA2K3E26WGBQI6PXBYWZ4XIOPJHDFJKP",
  "CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV",
  "CBN3NCJSMOQTC6SPEYK3A44NU4VS3IPKTARJLI3Y77OH27EWBY36TP7U",
]);

const PERIOD_OPTIONS = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
] as const;

export default function TokensPage() {
  const { tokens, pairs, poolRiskData, loading, period, setPeriod } = useDataContext();

  const [selectedTab, setSelectedTab] = useState<"all" | "stablecoins" | "hot">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const realTokenRegex = useMemo(() => /^[^:]+:G[A-Z0-9]{55}$/, []);

  const filteredRealTokens = useMemo(() => {
    return tokens.filter((token: Token) => realTokenRegex.test(token.name) || token.symbol.toUpperCase() === "XLM");
  }, [tokens, realTokenRegex]);

  const isStablecoin = (tokenId: string): boolean => STABLECOIN_IDS.has(tokenId);

  const pairMap = useMemo(() => {
    const m = new Map<string, {token0:string;token1:string}>();
    for (const p of pairs) m.set(p.id, {token0:p.token0,token1:p.token1});
    return m;
  }, [pairs]);

  const volumeMap = useMemo(() => {
    const volMap = new Map<string, number>();
    for (const pd of poolRiskData) {
      const vol = parseFloat(pd.volume) || 0;
      const p = pairMap.get(pd.pairId);
      if (!p) continue;
      volMap.set(p.token0, (volMap.get(p.token0) || 0) + vol);
      volMap.set(p.token1, (volMap.get(p.token1) || 0) + vol);
    }
    return volMap;
  }, [poolRiskData, pairMap]);

  const tokenPairCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const token of filteredRealTokens) {
      map.set(token.id, token.pairs.length);
    }
    return map;
  }, [filteredRealTokens]);

  const topPairCountTokens = useMemo(() => {
    const arr = Array.from(tokenPairCountMap.entries());
    arr.sort((a,b)=>b[1]-a[1]);
    return new Set<string>(arr.slice(0,10).map(i=>i[0]));
  }, [tokenPairCountMap]);

  const topVolumeTokens = useMemo(() => {
    const arr = Array.from(volumeMap.entries());
    arr.sort((a,b)=>b[1]-a[1]);
    return new Set<string>(arr.slice(0,10).map(i=>i[0]));
  }, [volumeMap]);

  const hotTokens = useMemo(() => {
    const s = new Set<string>();
    for (const tid of Array.from(topPairCountTokens)) s.add(tid);
    for (const tid of Array.from(topVolumeTokens)) s.add(tid);
    return s;
  }, [topPairCountTokens, topVolumeTokens]);

  const filteredTokens = useMemo(() => {
    return filteredRealTokens.filter((token: Token) => {
      const q = searchQuery.toLowerCase();
      const matches = token.name.toLowerCase().includes(q) || token.symbol.toLowerCase().includes(q);
      if (!matches) return false;

      if (selectedTab === "stablecoins") return isStablecoin(token.id);
      if (selectedTab === "hot") return hotTokens.has(token.id);
      return true;
    });
  }, [filteredRealTokens, searchQuery, selectedTab, hotTokens]);

  const totalPages = Math.ceil(filteredTokens.length / rowsPerPage);
  const startIndex = (currentPage - 1)*rowsPerPage;
  const displayedTokens = filteredTokens.slice(startIndex, startIndex+rowsPerPage);

  const handleReset = () => {
    setSearchQuery('');
    setPeriod('24h');
    setSelectedTab('all');
    setCurrentPage(1);
  };

  const explorerLink = (token: Token) => {
    if (token.symbol.toUpperCase() === 'XLM') {
      return `https://stellar.expert/explorer/public/asset/native`;
    } else {
      const [sym, iss] = token.name.split(':');
      return `https://stellar.expert/explorer/public/asset/${sym}-${iss}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex flex-col items-center justify-center gap-2">
        Loading tokens data...
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        <motion.div
          className="space-y-0.5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Tokens</h1>
          <p className="text-sm text-muted-foreground">Track and analyze token performance</p>
        </motion.div>

        {/* Top Pools globally on tokens page */}
        <TopPools
          data={poolRiskData}
          pairs={pairs}
          tokens={tokens}
          stablecoinIds={STABLECOIN_IDS}
          period={period}
        />

        <div className="stat-card">
          <Card className="p-6 bg-card border-border hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-muted-foreground">Total Real Tokens Indexed</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="text-2xl font-bold text-foreground mt-1">{filteredRealTokens.length}</h3>
              <p className="text-sm text-muted-foreground mt-1">---</p>
            </CardContent>
          </Card>
        </div>

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
                title="Show all tokens"
              >
                All Tokens
              </Button>
              <Button
                variant={selectedTab === "stablecoins" ? "default" : "secondary"}
                onClick={() => setSelectedTab("stablecoins")}
                className="h-9"
                title="Show only stablecoins"
              >
                Stablecoins
              </Button>
              <Button
                variant={selectedTab === "hot" ? "default" : "secondary"}
                onClick={() => setSelectedTab("hot")}
                className="h-9"
                title="Show hot tokens"
              >
                Hot Tokens
              </Button>
            </div>
            <Button
              variant="outline"
              className="h-9 gap-2"
              onClick={() => window.open('https://api.hoops.finance', '_blank')}
              title="Read the documentation"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true"/>
              Read the docs
            </Button>
          </div>

          <div className="flex-center-g-4">
            <Select
              value={period as "24h"|"7d"|"30d"}
              onValueChange={(value: "24h"|"7d"|"30d") => setPeriod(value)}
            >
              <SelectTrigger className="w-[180px] h-9" title="Select time period">
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
              <Search className="search-bar" aria-hidden="true"/>
              <Input
                placeholder="Search by token name or symbol"
                className="pl-10 h-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search tokens"
              />
            </div>

            <Button variant="secondary" className="h-9" onClick={handleReset} title="Reset filters">
              Reset
            </Button>
          </div>
        </motion.div>

        <motion.div
          className="pools-motion"
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
                    <TableCell colSpan={4} className="h-10 px-4 text-center text-sm text-muted-foreground">
                      No tokens found
                    </TableCell>
                  </TableRow>
                ) : (
                  displayedTokens.map((token: Token) => {
                    const [symbolName] = token.name.split(':');
                    const priceDisplay = token.price > 0 ? token.price.toLocaleString(undefined,{minimumFractionDigits:2,maximumFractionDigits:6}) : '-';
                    const explorer = explorerLink(token);

                    let detailsUrl: string;
                    if (token.symbol.toUpperCase()==='XLM') {
                      detailsUrl = `/tokens/native`;
                    } else {
                      detailsUrl = `/tokens/${token.name.replace(/:/g,'-')}`;
                    }

                    return (
                      <TableRow
                        key={token.id}
                        className="hoverable-row group"
                        title={`View details for ${symbolName}`}
                        style={{cursor:'pointer'}}
                        onClick={()=> window.location.href = detailsUrl}
                      >
                        <TableCell className="h-10 px-4 align-middle">
                          <div className="flex-center-g-2" title={token.symbol}>
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden relative">
                              {token.symbol.slice(0,1).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium">{symbolName}</div>
                              <div className="text-sm text-muted-foreground">{token.symbol}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="table-header-cell">
                          ${priceDisplay}
                        </TableCell>
                        <TableCell className="table-header-cell text-sm text-muted-foreground">
                          {new Date(token.lastUpdated).toLocaleString()}
                        </TableCell>
                        <TableCell className="table-header-cell">
                          <a
                            href={explorer}
                            className="underline text-primary hover:text-primary/80"
                            target="_blank"
                            rel="noreferrer"
                            title="View on Stellar Expert"
                          >
                            Explorer
                          </a>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="table-footer">
              <div className="flex-center-g-4">
                <div className="flex-center-g-2">
                  <span className="text-sm text-muted-foreground">Show</span>
                  <Select
                    value={rowsPerPage.toString()}
                    onValueChange={(value) => {
                      setRowsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[70px] h-8" title="Select number of entries per page">
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
                  Showing {(currentPage - 1)*rowsPerPage + 1} to {Math.min((currentPage - 1)*rowsPerPage + rowsPerPage, filteredTokens.length)} of {filteredTokens.length} entries
                </div>
              </div>
              <div className="flex-center-g-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setCurrentPage(p => Math.max(1,p-1))}
                  disabled={currentPage===1}
                  title="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true"/>
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({length: totalPages},(_,i)=>i+1)
                    .filter(page => page===1 || page===totalPages || Math.abs(page - currentPage)<=1)
                    .map((page, idx, arr) => (
                      <React.Fragment key={page}>
                        {idx>0 && arr[idx-1]!==page-1 && (
                          <span className="px-2 text-sm text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage===page?"default":"outline"}
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => setCurrentPage(page)}
                          title={`Go to page ${page}`}
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
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p+1))}
                  disabled={currentPage===totalPages}
                  title="Next page"
                >
                  Next
                  <ChevronRight className="h-4 w-4" aria-hidden="true"/>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
