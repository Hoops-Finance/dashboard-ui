// /app/pools/[protocol]/[pairid]/page.tsx

import {
  BackToPoolsButtonClient,
  PoolHeaderButtonsClient,
  ProtocolBadgesClient,
} from "./PoolPageClient";
import {
  fetchPeriodDataFromServer,
  fetchCoreData,
  fetchCandlesWithCacheAndRateLimit,
} from "@/services/serverData.service";
import {
  CandleDataPoint,
  getTimeRangeForPeriod,
  PERIOD_OPTIONS,
  VolumeDataPoint,
  type AllowedPeriods,
} from "@/utils/utilities";
import type { Metadata } from "next";
import { generateTokenRoutes } from "@/app/tokens/[tokenid]/page";
import { getCachedRoutes } from "@/lib/routeCache";
import { Pair, PoolRiskApiResponseObject } from "@/utils/types";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BarChart3,
  ChevronRight,
  ExternalLink,
  FileCode,
  LineChart,
  Lock,
  Plus,
  Settings,
  Share2,
  Shield,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { JSX, ReactNode, Suspense } from "react";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ChartComponent from "@/components/ChartComponent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PoolContractButtonsClient } from "./PoolPageClient";
import "./pools.css";
// Enable ISR – revalidate this page every day.
export const revalidate = 86400;

export async function generatePairRoutes() {
  const defaultPeriod: AllowedPeriods = "14d";
  const { poolRiskData } = await fetchPeriodDataFromServer(defaultPeriod);
  const { pairs, tokens } = await fetchCoreData();

  const routesSet = new Set<string>();
  const routes: { protocol: string; pair: string }[] = [];
  const Max_Routes = 10000;
  let index = 0;
  const maxRoutes = process.env.MAX_ROUTES
    ? parseInt(process.env.MAX_ROUTES)
      : Max_Routes
      ? Max_Routes
      : undefined;
  for (const pool of poolRiskData) {
    if (maxRoutes && index >= maxRoutes) break;
    index++;

    const protocol = pool.protocol.toLowerCase();
    let pairId: string;
    // Try to find the pair details using pool.pairId.
    const p = pairs.find((pair) => pair.id === pool.pairId);
    if (!p) {
      pairId = pool.market.replace(/\//g, "-");
    } else {
      const t0 = tokens.find((t) => t.id === p.token0);
      const t1 = tokens.find((t) => t.id === p.token1);
      if (!t0 || !t1) {
        pairId = pool.market.replace(/\//g, "-");
      } else {
        // Replace ":" with "-" to match the client–side parsing.
        const t0Name = t0.name.replace(/:/g, "-");
        const t1Name = t1.name.replace(/:/g, "-");
        pairId = `${t0Name}-${t1Name}`;
      }
    }
    const routeKey = `${protocol}:${pairId}`;
    if (!routesSet.has(routeKey)) {
      routesSet.add(routeKey);
      routes.push({ protocol, pair: pairId });
    }
  }
  return routes;
}
/**
 * generateStaticParams
 *
 * Here we pre-generate all the routes for the pairs so we can verify and pregen all the data and metadata.
 */
export async function generateStaticParams() {
  const { pairRoutes } = await getCachedRoutes(generateTokenRoutes, generatePairRoutes);
  return pairRoutes;
}

/**
 * generateMetadata – (example implementation)
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ protocol: string; pair: string }>;
}): Promise<Metadata> {
  const { protocol, pair } = await params;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "https://app.hoops.finance";

  return {
    title: `Pool: ${protocol} – ${pair}`,
    description: `Details for pool ${protocol} with pair ${pair}.`,
    openGraph: {
      images: [`${baseUrl}/pools/${protocol}/${pair}/opengraph-image`],
    },
    twitter: {
      images: [`${baseUrl}/pools/${protocol}/${pair}/opengraph-image`],
    },
  };
}

/**
 * Main server component.
 * It fetches pool data and candle data (using fetchCandlesWithCacheAndRateLimit, now updated to accept two tokens),
 * transforms the candle data, and passes everything to the client component.
 */
export default async function PoolPage({
  params,
}: {
  params: Promise<{ protocol: string; pair: string }>;
}) {
  const defaultPeriod: AllowedPeriods = "14d";
  const { poolRiskData } = await fetchPeriodDataFromServer(defaultPeriod);
  const { pairs, tokens } = await fetchCoreData();
  const { protocol, pair } = await params;
  // Parse the "pair" parameter into token names (same logic as your client code)
  let token0Name: string, token1Name: string;
  const parts = pair.split("-");
  if (parts.length === 4) {
    token0Name = `${parts[0]}:${parts[1]}`;
    token1Name = `${parts[2]}:${parts[3]}`;
  } else if (parts.length === 3) {
    if (parts[0].toLowerCase() === "native") {
      token0Name = "native";
      token1Name = `${parts[1]}:${parts[2]}`;
    } else {
      token0Name = "native";
      token1Name = "XLM";
    }
  } else {
    token0Name = "native";
    token1Name = "native";
  }

  // Get the time range for the default period.
  const { from, to } = getTimeRangeForPeriod(defaultPeriod);
  // Fetch candle data for the pool using the updated caching function.
  // (Ensure that fetchCandlesWithCacheAndRateLimit is updated to accept token0 and token1.)
  const rawCandleData = await fetchCandlesWithCacheAndRateLimit(token0Name, from, to, token1Name);

  // Transform raw candle data into two arrays:
  // 1. chartCandleData: for price info (including baseVolume)
  // 2. chartVolumeData: for volume chart (using baseVolume as the value)
  const chartCandleData = rawCandleData.map((c) => ({
    time: c.time,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
    baseVolume: c.baseVolume, // now included so types match
  }));
  const chartVolumeData = rawCandleData.map((c) => ({
    time: c.time,
    value: c.baseVolume,
    color: c.close >= c.open ? "#26a69a" : "#ef5350",
  }));
  const poolData = await getPoolFromPoolsByTokenNames(pairs, poolRiskData, token0Name, token1Name);

  if (!poolData) {
    return <PoolNotFound />;
  }
  return (
    <div className="min-h-[calc(100vh-72px)] bg-background flex flex-col">
      <div className="container max-w-7xl mx-auto p-4 flex-1 flex flex-col">
        <div className="PoolPage">
          <PoolHeader protocol={protocol} poolData={poolData} />
          <PriceVolumeChart
            period={defaultPeriod}
            candleData={chartCandleData}
            volumeData={chartVolumeData}
          />
          <PoolDetailsCards poolData={poolData} protocol={protocol} />
        </div>
      </div>
    </div>
  );
}

export async function getPoolFromPoolsByTokenNames(
  pairs: Pair[],
  poolRiskData: PoolRiskApiResponseObject[],
  token0Name: string,
  token1Name: string,
): Promise<PoolRiskApiResponseObject | undefined> {
  const foundPair = pairs.find((pair) => {
    if (!pair.token0Details || !pair.token1Details) {
      return false;
    }
    return (
      (pair.token0Details.name === token0Name && pair.token1Details.name === token1Name) ||
      (pair.token1Details.name === token0Name && pair.token0Details.name === token1Name)
    );
  });
  if (!foundPair) return undefined;
  return poolRiskData.find((pool) => pool.pairId === foundPair.id);
}

function PoolNotFound(): JSX.Element {
  return (
    <div className="PoolNotFound">
      <div className="PoolNotFoundInner">
        <AlertCircle className="IconLargePrimary" aria-hidden="true" />
        <p className="TextMutedSmall">Pool not found</p>
        <BackToPoolsButtonISR />
      </div>
    </div>
  );
}

const getProtocolDisplay = (protocol: string): string =>
  protocol.toLowerCase() === "aqua"
    ? "Aquarius"
    : protocol.charAt(0).toUpperCase() + protocol.slice(1).toLowerCase();

function PoolHeader({
  protocol,
  poolData,
}: {
  protocol: string;
  poolData: PoolRiskApiResponseObject;
}): JSX.Element {
  return (
    <header className="HeaderSection">
      <div className="FlexRowBetweenSm">
        <div className="FlexRowBetweenSm">
          <Suspense fallback={<BackToPoolsButtonISR />}>
            <BackToPoolsButtonClient />
          </Suspense>
          <div className="FlexItemsCenterGap3 flex-wrap">
            <Suspense fallback={<ProtocolBadgesISR protocol={protocol} />}>
              <ProtocolBadgesClient protocol={protocol} />
            </Suspense>
            <h1 className="text-xl font-bold tracking-tight">{poolData.market}</h1>
          </div>
        </div>
        <Suspense fallback={<PoolHeaderButtonsISR protocol={protocol} market={poolData.market} />}>
          <PoolHeaderButtonsClient protocol={protocol} market={poolData.market} />
        </Suspense>
      </div>
    </header>
  );
}

export function PriceVolumeChart({
  period,
  candleData,
  volumeData,
}: {
  period: string;
  candleData: CandleDataPoint[];
  volumeData: VolumeDataPoint[];
}) {
  return (
    <section className="PriceVolumeChart" aria-label="Price & Volume Chart">
      <div className="PriceVolumeHeader">
        <div className="FlexItemsCenterGap3">
          <LineChart className="IconSmallPrimary" aria-hidden="true" />
          Price & Volume
        </div>
        {/* Period selection is broken, it should update the candles, the pooldata, etc, and then rerender components.  probably should only be supported on client side. alternatively it would be even better for SEO if we were to pre-render all the possible periods, and add them to the site map, but as of now that is not practical. */}
        <Select value={period} disabled>
          <SelectTrigger className="ChartPeriodSelect" aria-label="Select time period">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent align="end">
            {PERIOD_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="ChartContentWrapper">
        <Suspense fallback={<Loading>Loading chart...</Loading>}>
          <ChartComponent candleData={candleData} volumeData={volumeData} />
        </Suspense>
      </div>
    </section>
  );
}

export function Loading({ children }: { children?: ReactNode }) {
  return (
    <div className="Loading">
      <svg className="Spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {children && <div className="LoadingText">{children}</div>}
    </div>
  );
}

export function ProtocolBadgesISR({ protocol }: { protocol: string }) {
  const protocolPath = protocol === "aqua" ? "aquarius" : protocol;
  return (
    <Link href={`/pools/${protocolPath}`}>
      <Badge
        variant="outline"
        className={cn(
          "capitalizeInline",
          protocol === "soroswap" && "ProtocolBadgeSoroswap",
          protocol === "blend" && "ProtocolBadgeBlend",
          protocol === "phoenix" && "ProtocolBadgePhoenix",
          protocol === "aqua" && "ProtocolBadgeAqua",
        )}
      >
        {getProtocolDisplay(protocol)}
      </Badge>
    </Link>
  );
}

export function BackToPoolsButtonISR() {
  return (
    <Link
      href="/pools"
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "BackToPoolsBtn")}
    >
      <ChevronRight className="IconSmallPrimary rotate-180" aria-hidden="true" />
      Back to Pools
    </Link>
  );
}

export function PoolHeaderButtonsISR({ protocol, market }: { protocol: string; market: string }) {
  return (
    <div className="FlexItemsCenterGap3">
      <button
        className={cn(buttonVariants({ variant: "outline", size: "sm" }), "gap-2")}
        aria-label="Share (requires JavaScript)"
      >
        <Share2 className="IconSmallPrimary" aria-hidden="true" />
        Share
      </button>
      <Link
        href={`https://app.${protocol}.finance/pool/${market}`}
        target="_blank"
        className={cn(buttonVariants({ size: "sm" }), "gap-2")}
      >
        <Plus className="IconSmallPrimary" aria-hidden="true" />
        Add Liquidity
      </Link>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string | number;
  tooltip?: string;
  icon?: ReactNode;
}

const StatCard = ({ title, value, tooltip, icon }: StatCardProps) => (
  <div className="flex items-start space-x-4 p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
    {icon && <div className="p-2 bg-background rounded-md">{icon}</div>}
    <div className="flex-1 space-y-1">
      <div className="flex items-center">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {tooltip && (
          <span className="ml-2 text-muted-foreground cursor-help" title={tooltip}>
            ⓘ
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  </div>
);

export function PoolStatCard({ title, value, tooltip, icon }: StatCardProps) {
  return (
    <div className="statCard">
      {icon && <div className="statCardIcon">{icon}</div>}
      <div className="statCardContent">
        <div className="flex items-center">
          <p className="statCardTitle">{title}</p>
          {tooltip && (
            <span className="statCardTooltip" title={tooltip}>
              ⓘ
            </span>
          )}
        </div>
        <p className="statCardValue">{value}</p>
      </div>
    </div>
  );
}

export function PoolDetailsCards({
  poolData,
  protocol,
}: {
  poolData: PoolRiskApiResponseObject;
  protocol: string;
}) {
  return (
    <section className="PoolDetailsCards" aria-label="Pool Details">
      <Tabs defaultValue="overview">
        <TabsList className="TabsList">
          <TabsTrigger value="overview" className="TabsTrigger">
            Overview
          </TabsTrigger>
          <TabsTrigger value="risk" className="TabsTrigger">
            Risk
          </TabsTrigger>
          <TabsTrigger value="contract" className="TabsTrigger">
            Contract
          </TabsTrigger>
        </TabsList>

        {/* =========== OVERVIEW =========== */}
        <div className="mt-6 space-y-6">
          <TabsContent value="overview" className="space-y-6">
            <div className="GridTwo">
              <PoolStatCard
                title="24h Volume"
                value={`$${Number(poolData.volume).toLocaleString()}`}
                tooltip="Total trading volume in the last 24 hours"
                icon={<BarChart3 className="IconSmallPrimary" />}
              />
              <PoolStatCard
                title="Total Value Locked"
                value={`$${Number(poolData.totalValueLocked).toLocaleString()}`}
                tooltip="Total value of assets locked in the pool"
                icon={<Lock className="IconSmallPrimary" />}
              />
            </div>
            <div className="GridTwo">
              <PoolStatCard
                title="Total Fees"
                value={`$${Number(poolData.fees).toLocaleString()}`}
                tooltip="Total fees earned by liquidity providers"
                icon={<Settings className="IconSmallPrimary" />}
              />
              <PoolStatCard
                title="Current APR"
                value={poolData.apr}
                tooltip="Estimated annual percentage rate"
                icon={<LineChart className="IconSmallPrimary" />}
              />
            </div>
          </TabsContent>

          {/* =========== RISK =========== */}
          <TabsContent value="risk" className="mt-0 space-y-4">
            <Card className="border-none shadow-md">
              <CardHeader className="CardHeader">
                <CardTitle className="CardTitle">
                  <Shield className="IconSmallPrimary" aria-hidden="true" />
                  Risk Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="CenteredFlex">
                    <div className="CenteredText">
                      <Badge
                        variant={Number(poolData.riskScore) <= 50 ? "default" : "destructive"}
                        className="BadgeXL"
                      >
                        {Number(poolData.riskScore).toFixed(2)}
                      </Badge>
                      <p className="TextMutedSmall">
                        {Number(poolData.riskScore) <= 50 ? "Low Risk Pool" : "High Risk Pool"}
                      </p>
                    </div>
                  </div>
                  <div className="GridTwoSmall">
                    <PoolStatCard
                      title="Volatility"
                      value={`${(
                        (Number(poolData.volume) / Number(poolData.totalValueLocked)) *
                        100
                      ).toFixed(2)}%`}
                      tooltip="Price volatility indicator"
                      icon={<LineChart className="IconSmallPrimary" />}
                    />
                    <PoolStatCard
                      title="Liquidity Depth"
                      value={`$${Number(poolData.totalValueLocked).toLocaleString()}`}
                      tooltip="Measure of pool liquidity"
                      icon={<Lock className="IconSmallPrimary" />}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* =========== CONTRACT =========== */}
          <TabsContent value="contract" className="TabsContent">
            <Card>
              <CardHeader>
                <CardTitle>
                  <FileCode className="IconSmallPrimary" aria-hidden="true" />
                  Contract Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="contractInfo">
                    <div className="flex-row">
                      <div className="flex-col gap-5 width-half height-full">
                        <div>
                          <span className="p-2 text-sm font-semibold text-muted-foreground">
                            Contract Address
                          </span>
                        </div>
                        <div>
                          <span className="p-2 text-sm flex-1 break-all font-mono">
                            {poolData.pairId}
                          </span>
                        </div>
                      </div>
                      <div className="flex-row">
                        <Suspense
                          fallback={
                            <Link
                              href={`https://stellar.expert/explorer/public/contract/${poolData.pairId}`}
                              target="_blank"
                              className={cn(
                                buttonVariants({ variant: "ghost", size: "sm" }),
                                "h-8 w-8 p-0",
                              )}
                              aria-label="View on Explorer"
                            >
                              <ExternalLink className="IconSmallPrimary" aria-hidden="true" />
                            </Link>
                          }
                        >
                          <PoolContractButtonsClient contractId={poolData.pairId} />
                        </Suspense>
                      </div>
                    </div>
                  </div>
                  <div className="GridTwoSmall">
                    <PoolStatCard
                      title="Protocol Version"
                      value={`${getProtocolDisplay(protocol)} V1`}
                      tooltip="Current protocol version"
                      icon={<Tag className="IconSmallPrimary" />}
                    />
                    <PoolStatCard
                      title="Fee Model"
                      value="Static"
                      tooltip="Type of fee model used"
                      icon={<Settings className="IconSmallPrimary" />}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </div>
      </Tabs>
    </section>
  );
}
