'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Home, ChevronRight, ExternalLink, AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { ProtocolLogo } from "@/components/protocol-logo";
import { formatDollarAmount, formatPercentage } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/components/ThemeContext";

const PERIODS = [
  { value: '24h', label: '24H Period' },
  { value: '7d', label: '7D Period' },
  { value: '14d', label: '14D Period' },
  { value: '30d', label: '30D Period' },
  { value: '90d', label: '90D Period' },
  { value: '180d', label: '180D Period' },
  { value: '360d', label: '360D Period' }
] as const;

const ENTRIES_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

interface ProtocolPageContentProps {
  protocol: string;
  protocolInfo: {
    name: string;
    logo: string;
    description: string;
    links: { url: string; name: string }[];
  };
  pools: {
    pairId: string;
    market: string;
    apr: string;
    totalValueLocked: string;
    volume: string;
    fees: string;
    riskScore: string;
  }[];
  paginatedPools: {
    pairId: string;
    market: string;
    apr: string;
    totalValueLocked: string;
    volume: string;
    fees: string;
    riskScore: string;
  }[];
  currentPage: number;
  totalPages: number;
  entriesPerPage: number;
  startIndex: number;
  currentPeriod: string;
  error: string | null;
  debugInfo: Record<string, unknown>;
  stats: {
    tvl: number;
    volume24h: number;
    poolCount: number;
    averageApy: number;
  };
}

export function ProtocolPageContent({
  protocol,
  protocolInfo,
  pools,
  paginatedPools,
  currentPage,
  totalPages,
  entriesPerPage,
  startIndex,
  currentPeriod,
  error,
  debugInfo,
  stats
}: ProtocolPageContentProps) {
  const { theme } = useTheme();

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Breadcrumbs */}
      <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center hover:text-foreground">
          <Home className="h-4 w-4" />
        </Link>
        <ChevronRight className="h-4 w-4" />
        <Link href="/pools" className="hover:text-foreground">
          Pools
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">
          {protocolInfo.name}
        </span>
      </nav>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6">
        {/* Protocol Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <ProtocolLogo 
                logo={protocolInfo.logo} 
                name={protocolInfo.name} 
              />
              <div>
                <CardTitle>{protocolInfo.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {protocolInfo.description}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              {protocolInfo.links.map((link: { url: string; name: string }) => (
                <Button
                  key={link.url}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  asChild
                >
                  <a 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    {link.name}
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              ))}
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Value Locked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${formatDollarAmount(stats.tvl)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {stats.poolCount} pools
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                24h Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${formatDollarAmount(stats.volume24h)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last 24 hours
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Pools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.poolCount}</div>
              <p className="text-xs text-muted-foreground">
                Total pools
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Average APY
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(stats.averageApy)}%
              </div>
              <p className="text-xs text-muted-foreground">
                Across all pools
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pools Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle>{protocolInfo.name} Pools</CardTitle>
                <Select
                  defaultValue={currentPeriod}
                  onValueChange={(value) => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('period', value);
                    window.location.href = url.toString();
                  }}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent>
                    {PERIODS.map(period => (
                      <SelectItem key={period.value} value={period.value}>
                        {period.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <p className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + entriesPerPage, pools.length)} of {pools.length} pools
              </p>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pair</TableHead>
                  <TableHead className="text-right">Est. 7D Period APR</TableHead>
                  <TableHead className="text-right">TVL</TableHead>
                  <TableHead className="text-right">7d Volume</TableHead>
                  <TableHead className="text-right">7d Fees</TableHead>
                  <TableHead className="text-right">Risk Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedPools.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground">
                      No pools found for {protocolInfo.name}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedPools.map((pool: { pairId: string; market: string; apr: string; totalValueLocked: string; volume: string; fees: string; riskScore: string }) => (
                    <TableRow key={pool.pairId}>
                      <TableCell className="font-medium">
                        {pool.market}
                      </TableCell>
                      <TableCell className="text-right">
                        {pool.apr}
                      </TableCell>
                      <TableCell className="text-right">
                        ${formatDollarAmount(parseFloat(pool.totalValueLocked))}
                      </TableCell>
                      <TableCell className="text-right">
                        ${formatDollarAmount(parseFloat(pool.volume))}
                      </TableCell>
                      <TableCell className="text-right">
                        ${formatDollarAmount(parseFloat(pool.fees))}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={`font-medium ${
                          parseFloat(pool.riskScore) <= 50 ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {pool.riskScore}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                        >
                          <Link href={`/pools/${protocol}/${pool.pairId}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="flex items-center space-x-2 text-sm">
                <p className="text-sm text-muted-foreground">
                  Show
                </p>
                <Select
                  defaultValue={entriesPerPage.toString()}
                  onValueChange={(value) => {
                    const url = new URL(window.location.href);
                    url.searchParams.set('limit', value);
                    url.searchParams.delete('page'); // Reset to first page
                    window.location.href = url.toString();
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {ENTRIES_PER_PAGE_OPTIONS.map(value => (
                      <SelectItem key={value} value={value.toString()}>
                        {value}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  entries per page
                </p>
              </div>

              <div className="flex items-center space-x-6 lg:space-x-8">
                <div className="flex w-[100px] items-center justify-center text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('page', (currentPage - 1).toString());
                      window.location.href = url.toString();
                    }}
                    disabled={currentPage === 1}
                  >
                    <span className="sr-only">Go to previous page</span>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      // Show first, last, and pages around current page
                      return page === 1 || 
                             page === totalPages || 
                             Math.abs(page - currentPage) <= 1;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="text-muted-foreground">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            const url = new URL(window.location.href);
                            url.searchParams.set('page', page.toString());
                            window.location.href = url.toString();
                          }}
                        >
                          <span className="sr-only">Go to page {page}</span>
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                  <Button
                    variant="outline"
                    className="h-8 w-8 p-0"
                    onClick={() => {
                      const url = new URL(window.location.href);
                      url.searchParams.set('page', (currentPage + 1).toString());
                      window.location.href = url.toString();
                    }}
                    disabled={currentPage === totalPages}
                  >
                    <span className="sr-only">Go to next page</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 