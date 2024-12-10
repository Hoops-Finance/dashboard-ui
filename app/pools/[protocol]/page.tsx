import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { HomeIcon, ChevronRightIcon, ArrowTopRightOnSquareIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { ProtocolLogo } from "@/components/protocol-logo";
import { formatDollarAmount, formatPercentage } from "@/lib/utils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ChevronRight, ChevronLeft } from "lucide-react";
import { TabNavigation } from "./tab-navigation";

const DEBUG_MODE = false;

const PERIODS = [
  { value: '24h', label: '24H' },
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '180d', label: '180D' },
  { value: '360d', label: '360D' }
] as const;

// Define available protocols
const PROTOCOLS = ['soroswap', 'aquarius', 'blend', 'phoenix'] as const;
type Protocol = typeof PROTOCOLS[number];

// Protocol-specific information
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
    description: "Aqua Network is a decentralized finance platform on the Stellar network, offering tools for liquidity provision, trading, and governance. It empowers users to earn rewards, vote on proposals, and participate in a vibrant DeFi ecosystem.",
    logo: "/images/protocols/aqua.svg",
    links: [
      { name: "Website", url: "https://aquarius.finance" },
      { name: "Documentation", url: "https://docs.aquarius.finance" },
    ]
  },
  blend: {
    name: "Blend",
    description: "Blend is a decentralized exchange aggregator that sources liquidity from multiple DEXes to provide the best trading rates.",
    logo: "/images/protocols/blend.svg",
    links: [
      { name: "Website", url: "https://blend.finance" },
      { name: "Docs", url: "https://docs.blend.finance" },
    ]
  },
  phoenix: {
    name: "Phoenix",
    description: "Phoenix is a decentralized perpetual exchange protocol built on Stellar, offering leveraged trading with deep liquidity.",
    logo: "/images/protocols/phoenix.svg",
    links: [
      { name: "Website", url: "https://phoenix.finance" },
      { name: "Documentation", url: "https://docs.phoenix.finance" },
    ]
  }
};

// Add protocol mapping
const PROTOCOL_MAPPING: Record<Protocol, string> = {
  soroswap: 'soroswap',
  phoenix: 'phoenix',
  aquarius: 'aqua',
  blend: 'blend'
};

function getProtocolStats(pools: any[]) {
  if (!pools?.length) {
    return {
      tvl: 0,
      volume24h: 0,
      poolCount: 0,
      averageApy: 0,
    };
  }
  
  return {
    tvl: pools.reduce((sum, pool) => sum + parseFloat(pool.totalValueLocked || '0'), 0),
    volume24h: pools.reduce((sum, pool) => sum + parseFloat(pool.volume || '0'), 0),
    poolCount: pools.length,
    averageApy: pools.reduce((sum, pool) => {
      const apr = parseFloat(pool.apr?.replace('%', '') || '0');
      return sum + apr;
    }, 0) / pools.length,
  };
}

interface DebugInfo {
  requestUrl: string;
  requestHeaders: {
    Authorization: string;
    'Content-Type': string;
  };
  responseStatus: number;
  responseStatusText: string;
  responseTime: number;
  rawResponse: any;
  error: string | null;
  poolsCount: number;
  currentProtocol: string;
}

interface Pool {
  pairId: string;
  protocol: string;
  market: string;
  marketIcon?: string;
  apr: string;
  totalValueLocked: string;
  volume: string;
  fees: string;
  riskScore: string;
}

const ENTRIES_PER_PAGE_OPTIONS = [10, 25, 50, 100] as const;

export default async function ProtocolPage({
  params,
  searchParams,
}: {
  params: { protocol: string };
  searchParams: { period?: string; page?: string; limit?: string };
}) {
  if (!PROTOCOLS.includes(params.protocol as Protocol)) {
    notFound();
  }

  const protocol = params.protocol as Protocol;
  const protocolInfo = PROTOCOL_INFO[protocol];
  const mappedProtocol = PROTOCOL_MAPPING[protocol];
  const period = searchParams.period || '30d';
  const currentPage = Number(searchParams.page) || 1;
  const entriesPerPage = Number(searchParams.limit) || 10;

  // Fetch data from Hoops API
  let allPools: Pool[] = [];
  let protocolPools: Pool[] = [];
  let error = null;
  let debugInfo: DebugInfo = {
    requestUrl: `${process.env.HOOPS_API_URL!}?period=${period}`,
    requestHeaders: {
      'Authorization': 'Bearer [HIDDEN]',
      'Content-Type': 'application/json',
    },
    responseStatus: 0,
    responseStatusText: '',
    responseTime: 0,
    rawResponse: null,
    error: null,
    poolsCount: 0,
    currentProtocol: protocol,
  };

  try {
    const startTime = Date.now();
    
    const response = await fetch(`${process.env.HOOPS_API_URL!}?period=${period}`, {
      headers: {
        'Authorization': `Bearer ${process.env.HOOPS_API_KEY}`,
        'Content-Type': 'application/json',
      },
      next: { revalidate: 60 }
    });

    debugInfo.responseTime = Date.now() - startTime;
    debugInfo.responseStatus = response.status;
    debugInfo.responseStatusText = response.statusText;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    debugInfo.rawResponse = data;
    
    // Transform all pools data
    allPools = (Array.isArray(data) ? data : []).map((pool: any) => ({
      pairId: pool.pairId || '',
      protocol: pool.protocol || '',
      market: pool.market || '',
      marketIcon: pool.marketIcon,
      apr: pool.apr || '0%',
      totalValueLocked: pool.totalValueLocked || '0',
      volume: pool.volume || '0',
      fees: pool.fees || '0',
      riskScore: pool.riskScore || (pool.riskFactors?.score?.toFixed(2)) || '0',
    }));
    
    // Filter pools for current protocol using mapped name
    protocolPools = allPools.filter(pool => 
      pool.protocol.toLowerCase() === mappedProtocol.toLowerCase()
    );

    debugInfo.poolsCount = allPools.length;

  } catch (e) {
    console.error('Error fetching pool data:', e);
    error = e instanceof Error ? e.message : 'An error occurred';
    debugInfo.error = error;
  }

  const stats = getProtocolStats(protocolPools);

  // Function to format period for display
  const formatPeriodDisplay = (period: string) => {
    switch (period) {
      case '24h': return '24H';
      case '7d': return '7D';
      case '30d': return '30D';
      case '90d': return '90D';
      case '180d': return '180D';
      case '360d': return '360D';
      default: return '30D';
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(protocolPools.length / entriesPerPage);
  const startIndex = (currentPage - 1) * entriesPerPage;
  const endIndex = Math.min(startIndex + entriesPerPage, protocolPools.length);
  const paginatedPools = protocolPools.slice(startIndex, endIndex);

  return (
    <main className="container mx-auto p-4 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1 text-sm text-muted-foreground">
        <Link href="/" className="flex items-center hover:text-foreground" aria-label="Home">
          <HomeIcon className="h-4 w-4" />
        </Link>
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        <Link href="/pools" className="hover:text-foreground">
          Pools
        </Link>
        <ChevronRightIcon className="h-4 w-4" aria-hidden="true" />
        <span className="text-foreground font-medium" aria-current="page">
          {protocolInfo.name}
        </span>
      </nav>

      {error && (
        <Alert variant="destructive" role="alert">
          <ExclamationCircleIcon className="h-4 w-4" aria-hidden="true" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-8">
        {/* Protocol Info Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 flex items-center justify-center" aria-hidden="true">
                <ProtocolLogo 
                  logo={protocolInfo.logo} 
                  name={protocolInfo.name} 
                />
              </div>
              <div>
                <CardTitle>{protocolInfo.name}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                  {protocolInfo.description}
                </p>
              </div>
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
                {formatDollarAmount(stats.tvl)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across {stats.poolCount} pools
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
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

        {/* Pools Table Section */}
        <section aria-label="Pools data" className="space-y-4">
          {/* Navigation Tabs */}
          <div>
            <div className="flex h-10 items-center space-x-4 text-muted-foreground">
              <TabNavigation />
            </div>
          </div>

          {/* Search Controls */}
          <div className="flex items-center gap-4">
            <Select
              name="period"
              defaultValue={period}
              aria-label="Select time period"
            >
              <SelectTrigger className="w-[180px] h-9">
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

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                type="search"
                name="search"
                placeholder="Search by token/pair/pool address"
                className="pl-10 h-9"
                aria-label="Search pools"
              />
            </div>

            <Button 
              variant="secondary" 
              className="h-9"
              aria-label="Reset filters"
            >
              Reset
            </Button>
          </div>

          {/* Pools Table */}
          <div className="rounded-lg border bg-card text-card-foreground shadow">
            <div className="relative w-full overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-10 px-4 align-middle font-medium text-muted-foreground">Pair</TableHead>
                    <TableHead className="h-10 px-4 align-middle font-medium text-muted-foreground text-right">APR ({formatPeriodDisplay(period)})</TableHead>
                    <TableHead className="h-10 px-4 align-middle font-medium text-muted-foreground text-right">TVL</TableHead>
                    <TableHead className="h-10 px-4 align-middle font-medium text-muted-foreground text-right">Volume ({formatPeriodDisplay(period)})</TableHead>
                    <TableHead className="h-10 px-4 align-middle font-medium text-muted-foreground text-right">Fees ({formatPeriodDisplay(period)})</TableHead>
                    <TableHead className="h-10 px-4 align-middle font-medium text-muted-foreground text-right">Risk Score</TableHead>
                    <TableHead className="h-10 px-4 align-middle font-medium text-muted-foreground text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedPools.length === 0 ? (
                    <TableRow>
                      <TableCell 
                        colSpan={7} 
                        className="h-10 px-4 text-center text-muted-foreground"
                      >
                        No pools found for {protocolInfo.name}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedPools.map((pool: Pool) => (
                      <TableRow 
                        key={pool.pairId} 
                        className="group hover:bg-muted/50 cursor-pointer border-b border-border"
                      >
                        <TableCell className="h-10 px-4 align-middle font-medium">
                          {pool.market}
                        </TableCell>
                        <TableCell className="h-10 px-4 align-middle text-right">
                          {pool.apr}
                        </TableCell>
                        <TableCell className="h-10 px-4 align-middle text-right">
                          {formatDollarAmount(parseFloat(pool.totalValueLocked))}
                        </TableCell>
                        <TableCell className="h-10 px-4 align-middle text-right">
                          {formatDollarAmount(parseFloat(pool.volume))}
                        </TableCell>
                        <TableCell className="h-10 px-4 align-middle text-right">
                          {formatDollarAmount(parseFloat(pool.fees))}
                        </TableCell>
                        <TableCell className="h-10 px-4 align-middle text-right">
                          <span className={`font-medium ${parseFloat(pool.riskScore) <= 50 ? 'text-green-500' : 'text-red-500'}`}>
                            {pool.riskScore}
                          </span>
                        </TableCell>
                        <TableCell className="h-10 px-4 align-middle text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-3 text-muted-foreground hover:text-foreground"
                            asChild
                          >
                            <Link 
                              href={`/pools/${protocol}/${pool.pairId}`}
                              aria-label={`View details for ${pool.market} pool`}
                            >
                              View Details
                              <ChevronRight className="ml-2 h-4 w-4" aria-hidden="true" />
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-4 border-t border-border">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Show</span>
                    <Select
                      name="limit"
                      defaultValue={entriesPerPage.toString()}
                      aria-label="Number of entries per page"
                    >
                      <SelectTrigger className="w-[70px] h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ENTRIES_PER_PAGE_OPTIONS.map(value => (
                          <SelectItem key={value} value={value.toString()}>
                            {value}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-sm text-muted-foreground">entries</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {endIndex} of {protocolPools.length} entries
                  </p>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center gap-2">
                    <form className="flex items-center gap-2">
                      <input type="hidden" name="period" value={period} />
                      <input type="hidden" name="limit" value={entriesPerPage.toString()} />
                      <Button
                        variant="outline"
                        size="sm"
                        name="page"
                        value={(currentPage - 1).toString()}
                        disabled={currentPage === 1}
                        type="submit"
                        className="h-8"
                        aria-label="Previous page"
                      >
                        <ChevronLeft className="h-4 w-4 mr-2" aria-hidden="true" />
                        Previous
                      </Button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          return page === 1 || 
                                 page === totalPages || 
                                 Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => (
                          <Fragment key={page}>
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="text-sm text-muted-foreground px-2" aria-hidden="true">...</span>
                            )}
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              name="page"
                              value={page.toString()}
                              type="submit"
                              className="h-8 w-8 p-0"
                              aria-label={`Page ${page}`}
                              aria-current={currentPage === page ? "page" : undefined}
                            >
                              {page}
                            </Button>
                          </Fragment>
                        ))}
                      <Button
                        variant="outline"
                        size="sm"
                        name="page"
                        value={(currentPage + 1).toString()}
                        disabled={currentPage === totalPages}
                        type="submit"
                        className="h-8"
                        aria-label="Next page"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-2" aria-hidden="true" />
                      </Button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
