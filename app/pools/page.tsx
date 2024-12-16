"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useDataContext } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Flame, Diamond, Coins, Search, ChevronLeft, ChevronRight, X, ArrowUpDown, BookOpen } from 'lucide-react';
import { PoolRiskApiResponseObject, RankingFactors, RiskFactors } from "@/utils/newTypes";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type AllowedPeriods = "24h"|"7d"|"14d"|"30d"|"90d"|"180d"|"360d";

const topPoolsData = [
  { 
    title: "Best APR Pairs",
    icon: Flame,
    items: [
      { rank: 1, pair: "XLM/USDC", apr: 168.67 },
      { rank: 2, pair: "yXLM/USDC", apr: 126.86 },
      { rank: 3, pair: "yBTC/XLM", apr: 103.61 },
      { rank: 4, pair: "USDC/yETH", apr: 64.48 },
      { rank: 5, pair: "yUSDC/USDC", apr: -12.36 }
    ]
  },
  {
    title: "Best Blue-chip Pools",
    icon: Diamond,
    items: [
      { rank: 1, pair: "XLM/USDC", apr: 168.67 },
      { rank: 2, pair: "BTC/XLM", apr: 45.22 },
      { rank: 3, pair: "ETH/USDC", apr: 27.46 },
      { rank: 4, pair: "BTC/USDC", apr: 21.69 },
      { rank: 5, pair: "ETH/XLM", apr: 18.88 }
    ]
  },
  {
    title: "Best Stable Coin Pools",
    icon: Coins,
    items: [
      { rank: 1, pair: "USDC/USDT", apr: 69.53 },
      { rank: 2, pair: "USDC/yUSDC", apr: 23.07 },
      { rank: 3, pair: "USDC/yUSDT", apr: 22.59 },
      { rank: 4, pair: "USDT/yUSDC", apr: 18.73 },
      { rank: 5, pair: "yUSDT/USDC", apr: 0.37 }
    ]
  }
];

const PERIODS = [
  { value: '24h', label: '24H Period' },
  { value: '7d', label: '7D Period' },
  { value: '14d', label: '14D Period' },
  { value: '30d', label: '30D Period' },
  { value: '90d', label: '90D Period' },
  { value: '180d', label: '180D Period' },
  { value: '360d', label: '360D Period' }
] as const;

const PROTOCOLS = ['soroswap', 'phoenix', 'aquarius', 'blend'] as const;
type Protocol = typeof PROTOCOLS[number];

const PROTOCOL_MAPPING: Record<Protocol, string> = {
  soroswap: 'soroswap',
  phoenix: 'phoenix',
  aquarius: 'aqua',
  blend: 'blend'
};

type SortConfig = {
  key: keyof PoolRiskApiResponseObject | null;
  direction: 'asc' | 'desc' | null;
};

export default function PoolsPage() {
  const router = useRouter();
  const { poolRiskData, period, setPeriod, loading, pairs, tokens } = useDataContext(); // pairs and tokens needed to reconstruct URLs

  const [selectedProtocols, setSelectedProtocols] = useState<Protocol[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: null });

  const formatPercentage = (value: number) => {
    return {
      className: `percentage-value ${value >= 0 ? 'text-green-500' : 'text-red-500'}`,
      text: `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
    };
  };

  const filteredData = useMemo(() => {
    return poolRiskData.filter(pool => {
      const matchesSearch = searchQuery === '' || 
        pool.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.protocol.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesProtocol = selectedProtocols.length === 0 || 
        selectedProtocols.some(protocol => 
          pool.protocol.toLowerCase() === PROTOCOL_MAPPING[protocol].toLowerCase()
        );

      return matchesSearch && matchesProtocol;
    });
  }, [poolRiskData, searchQuery, selectedProtocols]);

  const handleSort = (key: keyof PoolRiskApiResponseObject) => {
    setSortConfig(current => {
      if (current.key === key) {
        if (current.direction === 'asc') {
          return { key, direction: 'desc' };
        }
        if (current.direction === 'desc') {
          return { key: null, direction: null };
        }
      }
      return { key, direction: 'asc' };
    });
  };

  const sortedAndFilteredData = useMemo(() => {
    const data = [...filteredData];
    if (sortConfig.key && sortConfig.direction) {
      data.sort((a, b) => {
        const aValue = a[sortConfig.key!];
        const bValue = b[sortConfig.key!];

        const getComparableValue = (
          value: string | number | RiskFactors | RankingFactors
        ): number => {
          if (typeof value === 'number') {
            return value;
          } else if (typeof value === 'string') {
            const parsed = parseFloat(value.replace(/[^0-9.-]+/g, ''));
            return isNaN(parsed) ? 0 : parsed;
          } else {
            return value.score;
          }
        };

        const comparableA = getComparableValue(aValue);
        const comparableB = getComparableValue(bValue);

        if (comparableA < comparableB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (comparableA > comparableB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedAndFilteredData.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const paginatedData = sortedAndFilteredData.slice(startIndex, startIndex + entriesPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedProtocols]);

  const handleProtocolClick = (protocol: Protocol) => {
    if (protocol === 'soroswap') {
      if (selectedProtocols.includes('soroswap') && selectedProtocols.length === 1) {
        setSelectedProtocols([]);
      } else {
        setSelectedProtocols(['soroswap']);
      }
    } else {
      setSelectedProtocols(prev => {
        if (prev.includes(protocol)) {
          return prev.filter(p => p !== protocol);
        }
        return [...prev, protocol];
      });
    }
  };

  const getProtocolDisplay = (proto: string) => {
    return proto.toLowerCase() === 'aqua' ? 'Aquarius' : proto;
  };

  const handleViewDetails = (pool: PoolRiskApiResponseObject) => {
    // We must convert pool.market (like "native/USDC") into a route using token name format:
    // Find the pair that matches pool.pairId
    const p = pairs.find(pr => pr.id === pool.pairId);
    if (!p) {
      // fallback: just use existing format
      const urlSafePair = pool.market.replace(/\//g, '-');
      router.push(`/pools/${pool.protocol.toLowerCase()}/${urlSafePair}?period=${period}`);
      return;
    }

    // p.token0Details.name and p.token1Details.name have the correct SYMBOL:ISSUER format
    // Construct a pair string like "SYMBOL:ISSUER-SYMBOL:ISSUER"
    const t0Name = p.token0Details.name;
    const t1Name = p.token1Details.name;

    const urlSafePair = `${t0Name.replace(/:/g, '-')}-${t1Name.replace(/:/g, '-')}`;
    router.push(`/pools/${pool.protocol.toLowerCase()}/${urlSafePair}?period=${period}`);
  };

  const SortableHeader = ({ 
    children, 
    sortKey, 
    align = 'left' 
  }: { 
    children: React.ReactNode; 
    sortKey: keyof PoolRiskApiResponseObject; 
    align?: 'left' | 'right';
  }) => (
    <TableHead 
      className={`h-10 px-4 align-middle font-medium text-muted-foreground cursor-pointer select-none ${
        align === 'right' ? 'text-right' : 'text-left'
      }`}
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center gap-1 justify-end">
        <span>{children}</span>
        <ArrowUpDown className={`h-4 w-4 ${
          sortConfig.key === sortKey 
            ? 'text-foreground' 
            : 'text-muted-foreground/50'
        }`} />
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <section className="relative">
        <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
          Loading pools data...
        </div>
      </section>
    );
  }

  return (
    <section className="relative">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Page Title */}
        <motion.div 
          className="space-y-0.5"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-2xl font-bold text-foreground">Explorer</h1>
          <p className="text-muted-foreground">Find the most profitable LPs across protocols</p>
        </motion.div>

        {/* Top Pools Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {topPoolsData.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              className="transform-gpu"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <section.icon className="h-5 w-5 text-primary" />
                    {section.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {section.items.map((item) => (
                    <motion.div
                      key={item.rank}
                      className="flex items-center justify-between group cursor-pointer"
                      whileHover={{ x: 4 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">#{item.rank}</span>
                        <span className="text-foreground font-medium group-hover:text-primary transition-colors duration-200">
                          {item.pair}
                        </span>
                      </div>
                      <span className={formatPercentage(item.apr).className}>
                        {formatPercentage(item.apr).text}
                      </span>
                    </motion.div>
                  ))}
                </CardContent>
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
                variant={selectedProtocols.length === 0 ? 'default' : 'secondary'}
                onClick={() => setSelectedProtocols([])}
                className="h-9"
              >
                All Pools
              </Button>
              {PROTOCOLS.map(protocol => (
                <Button 
                  key={protocol}
                  variant={selectedProtocols.includes(protocol) ? 'default' : 'secondary'}
                  onClick={() => handleProtocolClick(protocol)}
                  className="h-9 capitalize group"
                >
                  <span>{protocol}</span>
                  {selectedProtocols.includes(protocol) && (
                    <X className="ml-2 h-3 w-3 text-muted-foreground/60 group-hover:text-muted-foreground" />
                  )}
                </Button>
              ))}
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
              value={period as AllowedPeriods} 
              onValueChange={(v: AllowedPeriods) => { 
                setPeriod(v); 
                setCurrentPage(1); 
              }}
              aria-label="Select time period"
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                {PERIODS.map(p => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search by token/pair/pool address" 
                className="pl-10 h-9"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
            </div>

            <Button 
              variant="secondary" 
              className="h-9"
              onClick={() => {
                setSearchQuery('');
                setPeriod('24h');
                setCurrentPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </motion.div>

        {/* Pools Table */}
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
                  <TableHead>Protocol</TableHead>
                  <TableHead>Pair/Pool</TableHead>
                  <TableHead>Est. {PERIODS.find(p => p.value === period)?.label || '24H Period'} APR</TableHead>
                  <TableHead>TVL</TableHead>
                  <TableHead>{period} Volume</TableHead>
                  <TableHead>{period} Fees</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-10 px-4 text-center text-muted-foreground">
                      No pools data available
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((pool, index) => (
                    <TableRow 
                      key={index} 
                      className="group hover:bg-muted/50 cursor-pointer border-b border-border"
                      onClick={() => handleViewDetails(pool)}
                    >
                      <TableCell className="h-10 px-4 align-middle">
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "capitalize px-3 py-1",
                            pool.protocol === "soroswap" && "bg-purple-500/10 text-purple-500 border-purple-500/20",
                            pool.protocol === "blend" && "bg-green-500/10 text-green-500 border-green-500/20",
                            pool.protocol === "phoenix" && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                            pool.protocol === "aqua" && "bg-pink-500/10 text-pink-500 border-pink-500/20"
                          )}
                        >
                          {getProtocolDisplay(pool.protocol)}
                        </Badge>
                      </TableCell>
                      <TableCell className="h-10 px-4 align-middle font-medium">
                        {pool.market}
                      </TableCell>
                      <TableCell className="h-10 px-4 align-middle text-right font-medium">
                        {pool.apr}
                      </TableCell>
                      <TableCell className="h-10 px-4 align-middle text-right">
                        ${Number(pool.totalValueLocked).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="h-10 px-4 align-middle text-right">
                        ${Number(pool.volume).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="h-10 px-4 align-middle text-right">
                        ${Number(pool.fees).toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="h-10 px-4 align-middle text-right">
                        <span className={`font-medium ${Number(pool.riskScore) <= 50 ? 'text-green-500' : 'text-red-500'}`}>
                          {Number(pool.riskScore).toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell className="h-10 px-4 align-middle text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-3 text-muted-foreground hover:text-foreground"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(pool);
                          }}
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
            {sortedAndFilteredData.length > 0 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <Select
                      value={entriesPerPage.toString()}
                      onValueChange={(value) => {
                        setEntriesPerPage(Number(value));
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
                    Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, sortedAndFilteredData.length)} of {sortedAndFilteredData.length} entries
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
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
