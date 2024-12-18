"use client";

import React, { useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDataContext } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ProtocolLogo } from "@/components/protocol-logo";
import { formatDollarAmount, formatPercentage } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight, MessageCircleWarning } from "lucide-react";
import { TabNavigation } from "./tab-navigation";
import { PoolRiskApiResponseObject } from "@/utils/newTypes";
import { PoolsTable } from "@/components/PoolsTable";
import { TopPools } from "@/components/TopPools";

type AllowedPeriods = "24h"|"7d"|"14d"|"30d"|"90d"|"180d"|"360d";

const PERIODS = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '14d', label: '14D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '180d', label: '180D' },
  { value: '360d', label: '360D' }
] as const;

const PROTOCOLS = ['soroswap', 'aquarius', 'blend', 'phoenix'] as const;
type Protocol = typeof PROTOCOLS[number];

const PROTOCOL_INFO: Record<Protocol, {
  name: string;
  description: string;
  logo: string;
  links: { name: string; url: string; }[];
}> = {
  soroswap: {
    name: "Soroswap",
    description: "Soroswap is a decentralized exchange protocol built on the Stellar network, offering automated market making and liquidity provision services.",
    logo: "/images/protocols/soroswap.svg",
    links: [
      { name: "Website", url: "https://soroswap.finance" },
      { name: "Docs", url: "https://docs.soroswap.finance" },
    ]
  },
  aquarius: {
    name: "Aquarius",
    description: "Aqua Network is a decentralized finance platform on the Stellar network, offering tools for liquidity awards, trading, and governance.",
    logo: "/images/protocols/aqua.svg",
    links: [
      { name: "Website", url: "https://aquarius.finance" },
      { name: "Documentation", url: "https://docs.aquarius.finance" },
    ]
  },
  blend: {
    name: "Blend",
    description: `Blend is a decentralized finance protocol on the Stellar network, enabling lending, borrowing, and yield farming.`,
    logo: "/images/protocols/blend.svg",
    links: [
      { name: "Website", url: "https://blend.finance" },
      { name: "Docs", url: "https://docs.blend.finance" },
    ]
  },
  phoenix: {
    name: "Phoenix",
    description: "Phoenix is a decentralized automated market maker on the stellar network with liquidity pools and rewards.",
    logo: "/images/protocols/phoenix.svg",
    links: [
      { name: "Website", url: "https://phoenix.finance" },
      { name: "Documentation", url: "https://docs.phoenix.finance" },
    ]
  }
};

const PROTOCOL_MAPPING: Record<Protocol, string> = {
  soroswap: 'soroswap',
  phoenix: 'phoenix',
  aquarius: 'aqua',
  blend: 'blend'
};

function getProtocolStats(pools: PoolRiskApiResponseObject[]) {
  if (!pools?.length) {
    return {
      tvl: 0,
      volume24h: 0,
      poolCount: 0,
      averageApy: 0,
    };
  }

  const tvl = pools.reduce((sum, pool) => sum + parseFloat(pool.totalValueLocked || '0'), 0);
  const volume24h = pools.reduce((sum, pool) => sum + parseFloat(pool.volume || '0'), 0);
  const poolCount = pools.length;
  const averageApy = pools.reduce((sum, pool) => {
    const apr = parseFloat(pool.apr?.replace('%', '') || '0');
    return sum + apr;
  }, 0) / poolCount;

  return { tvl, volume24h, poolCount, averageApy };
}

const STABLECOIN_IDS = new Set<string>([
  "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75",
  "CDIKURWHYS4FFTR5KOQK6MBFZA2K3E26WGBQI6PXBYWZ4XIOPJHDFJKP",
  "CDTKPWPLOURQA2SGTKTUQOWRCBZEORB4BWBOMJ3D3ZTQQSGE5F6JBQLV",
  "CBN3NCJSMOQTC6SPEYK3A44NU4VS3IPKTARJLI3Y77OH27EWBY36TP7U"
]);

export default function ProtocolPage({ params }: { params: { protocol: string } }) {
  const searchParams = useSearchParams();
  const { poolRiskData, period, setPeriod, loading, pairs, tokens } = useDataContext();
  const protocol = params.protocol as Protocol;

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [entriesPerPage, setEntriesPerPage] = useState(Number(searchParams.get('limit')) || 10);

  const isValidProtocol = PROTOCOLS.includes(protocol);
  const mappedProtocol = isValidProtocol ? PROTOCOL_MAPPING[protocol] : null;
  const protocolInfo = isValidProtocol ? PROTOCOL_INFO[protocol] : null;

  const protocolPools = useMemo(() => {
    if (!isValidProtocol) return [];
    return poolRiskData.filter(pool =>
      pool.protocol.toLowerCase() === mappedProtocol!.toLowerCase()
    );
  }, [poolRiskData, mappedProtocol, isValidProtocol]);

  const stats = getProtocolStats(protocolPools);

  const filteredData = useMemo(() => {
    if (!isValidProtocol) return [];
    return protocolPools.filter(pool => {
      return searchQuery === '' ||
        pool.market.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.protocol.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [protocolPools, searchQuery, isValidProtocol]);

  if (!isValidProtocol) {
    return (
      <main className="container mx-auto p-4 space-y-8">
        <Alert variant="destructive" role="alert">
          <MessageCircleWarning className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            Invalid protocol specified.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="container mx-auto p-4 space-y-8">
        Loading pools data...
      </main>
    );
  }

  const formatPeriodDisplay = (p: AllowedPeriods) => {
    switch (p) {
      case '24h': return '24H';
      case '7d': return '7D';
      case '14d': return '14D';
      case '30d': return '30D';
      case '90d': return '90D';
      case '180d': return '180D';
      case '360d': return '360D';
      default: return '30D';
    }
  };

  return (
    <main className="container mx-auto p-4 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center hover:text-foreground" aria-label="Home">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 11l9-9 9 9M9 21V9c0-.58.24-1.12.66-1.53L12 5.13l2.34 2.34c.42.41.66.95.66 1.53v12" />
          </svg>
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <Link href="/pools" className="hover:text-foreground">
          Pools
        </Link>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="text-foreground font-medium" aria-current="page">
          {protocolInfo!.name}
        </span>
      </nav>

      <div className="grid gap-8">
        {/* Protocol Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex items-center justify-center" aria-hidden="true">
                <ProtocolLogo 
                  logo={protocolInfo!.logo} 
                  name={protocolInfo!.name} 
                />
              </div>
              <div>
                <CardTitle>{protocolInfo!.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {protocolInfo!.description}
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats Cards */}
        <div className="stat-card">
          <Card>
            <CardHeader className="card-header">
              <CardTitle className="text-sm font-medium">
                Total Value Locked
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDollarAmount(stats.tvl)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {stats.poolCount} pools
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="card-header">
              <CardTitle className="text-sm font-medium">
                Volume ({formatPeriodDisplay(period)})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatDollarAmount(stats.volume24h)}
              </div>
              <p className="text-xs text-muted-foreground">
                Last {formatPeriodDisplay(period)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="card-header">
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
            <CardHeader className="card-header">
              <CardTitle className="text-sm font-medium">
                Average APY ({formatPeriodDisplay(period)})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatPercentage(stats.averageApy)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all pools
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Top Pools for this protocol */}
        <TopPools
          data={protocolPools}
          pairs={pairs}
          tokens={tokens}
          stablecoinIds={STABLECOIN_IDS}
          period={period}
        />

        {/* Pools Table Section */}
        <section aria-label="Pools data" className="space-y-4">
          {/* Navigation Tabs */}
          <div>
            <div className="flex h-10 items-center space-x-4 text-muted-foreground">
              <TabNavigation />
            </div>
          </div>

          {/* Search Controls */}
          <div className="flex-center-g-4">
            <Select
              name="period"
              value={period}
              onValueChange={(v) => {
                setPeriod(v as AllowedPeriods);
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
              <Search className="search-bar" aria-hidden="true" />
              <Input
                type="search"
                placeholder="Search by token/pair/pool address"
                className="pl-10 h-9"
                aria-label="Search pools"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <Button 
              variant="secondary" 
              className="h-9"
              aria-label="Reset filters"
              onClick={() => {
                setSearchQuery('');
                setPeriod('30d');
                setCurrentPage(1);
              }}
            >
              Reset
            </Button>
          </div>

          <PoolsTable
            data={filteredData}
            pairs={pairs}
            tokens={tokens}
            period={period}
            initialEntriesPerPage={entriesPerPage}
            showSearch={false}
            showPagination={true}
            showPeriodLabel={true}
          />
        </section>
      </div>
    </main>
  );
}
