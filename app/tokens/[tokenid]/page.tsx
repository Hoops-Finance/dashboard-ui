// app/tokens/[tokenid]/page.tsx
import "source-map-support/register";

import { notFound } from "next/navigation";
import type { AllowedPeriods, CandleDataPoint, VolumeDataPoint } from "@/utils/utilities";
import type { AssetDetails, Market, Pair, PoolRiskApiResponseObject, Token } from "@/utils/types";

import {
  fetchCoreData,
  fetchPeriodDataFromServer,
  getPairsForToken,
  // [ADDED] We now will use fetchTokenDetailsWithCache, fetchCandlesWithCacheAndRateLimit
  fetchTokenDetailsWithCache,
  fetchCandlesWithCacheAndRateLimit,
} from "@/services/serverData.service";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import { TopPools } from "@/components/TopPools";
import { PoolsTable } from "@/components/PoolsTable";
import ChartComponent from "@/components/ChartComponent";
import { AlertCircle, ChevronRight } from "lucide-react";
import { UTCTimestamp } from "lightweight-charts";
import { Metadata, ResolvingMetadata } from "next";

export const revalidate = 3600;
export const dynamicParams = true;

const validNamePattern = /^[A-Z0-9]+-G[A-Z0-9]{55}$/;
const validIdPattern = /^C[A-Z0-9]{55}$/;

/** Limit final routes to 10 */
const MAX_ROUTES = 10;

/**
 * generateStaticParams => produce *two* routes if possible:
 *  - contract ID: (C[...])
 *  - token.name (SYMBOL-ISSUER) or "native" if XLM
 */

export async function generateStaticParams() {
  const { tokens } = await fetchCoreData();
  const routes: { tokenid: string }[] = [];

  // We track added routes to avoid pushing duplicates (e.g. two XLM entries).
  const addedRoutes = new Set<string>();

  for (const t of tokens) {
    // (1) Contract route if "C"-ID
    if (validIdPattern.test(t.id) && !addedRoutes.has(t.id)) {
      routes.push({ tokenid: t.id });
      addedRoutes.add(t.id);
    }

    // (2) XLM => "native"
    if (t.symbol.toUpperCase() === "XLM" && !addedRoutes.has("native")) {
      routes.push({ tokenid: "native" });
      addedRoutes.add("native");
    }

    // (3) Name-based route if matches "SYMBOL-GISSUER"
    if (validNamePattern.test(t.name)) {
      const slug = t.name.replace(/:/g, "-");
      if (!addedRoutes.has(slug)) {
        routes.push({ tokenid: slug });
        addedRoutes.add(slug);
      }
    }
  }

  // Verify routes via HEAD check (fetchTokenDetailsWithCache, headMode=true)
  const verifiedRoutes: { tokenid: string }[] = [];
  // Keep track so we don't run HEAD on the same normalized asset more than once
  const headCheckedAssets = new Map<string, boolean>();

  for (const r of routes) {
    const normalized = r.tokenid === "native" ? "XLM" : r.tokenid.replace(/-/g, ":");

    // Reuse HEAD result if we already checked this asset
    if (headCheckedAssets.has(normalized)) {
      if (headCheckedAssets.get(normalized) === true) {
        verifiedRoutes.push(r);
      } else {
        console.warn("[generateStaticParams] skipping route for", r.tokenid, "(cached HEAD fail)");
      }
    } else {
      const result = await fetchTokenDetailsWithCache(normalized, true);
      headCheckedAssets.set(normalized, result === true);

      if (result === true) {
        verifiedRoutes.push(r);
      } else {
        console.warn("[generateStaticParams] skipping route for", r.tokenid, "(HEAD fail)");
      }
      await sleep(350);
    }

    if (verifiedRoutes.length >= MAX_ROUTES) {
      console.log("[generateStaticParams] Reached MAX_ROUTES limit of", MAX_ROUTES);
      break;
    }
  }

  console.log("Final verified token routes (limited):", verifiedRoutes);
  return verifiedRoutes;
}

interface Props {
  params: Promise<{ tokenid: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata(
  { params, searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const { tokenid } = await params;
  return {
    title: `Token: ${tokenid}`,
    description: `Details for token ${tokenid}`,
  };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTimeRangeForPeriod(period: AllowedPeriods): { from: number; to: number } {
  const to = Math.floor(Date.now() / 1000);
  let from: number;
  switch (period) {
    case "24h":
      from = to - 24 * 3600;
      break;
    case "7d":
      from = to - 7 * 24 * 3600;
      break;
    case "14d":
      from = to - 14 * 24 * 3600;
      break;
    case "30d":
      from = to - 30 * 24 * 3600;
      break;
    case "90d":
      from = to - 90 * 24 * 3600;
      break;
    case "180d":
      from = to - 180 * 24 * 3600;
      break;
    case "360d":
      from = to - 360 * 24 * 3600;
      break;
    default:
      from = to - 14 * 24 * 3600;
      break;
  }
  return { from, to };
}

const ALL_PERIODS: AllowedPeriods[] = ["24h", "7d", "14d", "30d", "90d", "180d", "360d"];

/**
 * The main server component for a single token's details page
 */
export default async function TokenDetailsPage({ params }: { params: Promise<{ tokenid: string }> }) {
  const chartPeriod: AllowedPeriods = "14d";
  const { tokenid } = await params;

  const [{ tokens, pairs }, { poolRiskData }] = await Promise.all([
    fetchCoreData(),
    fetchPeriodDataFromServer(chartPeriod),
  ]);

  let routeParam = tokenid;
  if (routeParam === "native") {
    routeParam = "native";
  } else {
    routeParam = routeParam.replace(/-/g, ":");
  }

  const foundToken: Token | undefined = tokens.find((t) =>
    t.symbol.toUpperCase() === "XLM"
      ? routeParam === "native"
      : t.name === routeParam || t.id === routeParam,
  );
  if (!foundToken) {
    console.warn("[TokenDetailsPage] No matching token found => notFound()", routeParam);
    notFound();
  }

  const isPoolShare = foundToken.name.includes("Pool Share Token");
  const tokenPairs: Pair[] = getPairsForToken(foundToken, pairs);
  const pairIds = new Set(tokenPairs.map((p) => p.id));
  const tokenPools: PoolRiskApiResponseObject[] = poolRiskData.filter((pool) =>
    pairIds.has(pool.pairId),
  );

  // [ADDED] fetch the tokeninfo => get "asset" which might be "AQUA-GBNZ...-1"
  let tokenDetails: AssetDetails | null = null;
  let classicAssetString = "XLM";
  try {
    const result = await fetchTokenDetailsWithCache(routeParam, false);
    if (typeof result === "object" && result !== null) {
      tokenDetails = result;

      // If tokenDetails.asset is something like "AQUA-GBNZILSTVQZ4R7I...-1",
      // remove that trailing dash + digit
      if (tokenDetails.asset && tokenDetails.asset.toUpperCase() !== "XLM") {
        classicAssetString = tokenDetails.asset;
        const stripped = classicAssetString.replace(/-\d+$/, "");
        if (stripped !== classicAssetString) {
          console.log(
            "[TokenDetailsPage] Removing trailing '-1' etc:",
            classicAssetString,
            "=>",
            stripped,
          );
          classicAssetString = stripped;
        }
      }
    } else {
      console.warn("[TokenDetailsPage] tokeninfo GET returned false => partial data");
      // fallback: classicAssetString remains "XLM" if no details
    }
  } catch (err) {
    console.error("[TokenDetailsPage] error loading token info => partial page", err);
    // fallback: classicAssetString remains "XLM"
  }

  // If it's not a Pool Share token, we prefetch candle data for all periods
  // using the final "classicAssetString" string
  if (!isPoolShare && classicAssetString) {
    for (const p of ALL_PERIODS) {
      const { from, to } = getTimeRangeForPeriod(p);
      try {
        await fetchCandlesWithCacheAndRateLimit(classicAssetString, from, to);
      } catch (err) {
        console.error("[TokenDetailsPage] prefetch error for", p, err);
      }
    }
  }

  // We'll show chartPeriod=14d
  let chartCandleData: CandleDataPoint[] = [];
  let chartVolumeData: VolumeDataPoint[] = [];
  if (!isPoolShare && classicAssetString) {
    const { from, to } = getTimeRangeForPeriod(chartPeriod);
    try {
      const raw = await fetchCandlesWithCacheAndRateLimit(classicAssetString, from, to);
      chartCandleData = raw.map((c) => ({
        time: c.time,
        open: c.open,
        high: c.high,
        low: c.low,
        close: c.close,
      }));
      chartVolumeData = raw.map((c) => ({
        time: c.time,
        value: c.baseVolume,
        color: c.close >= c.open ? "#26a69a" : "#ef5350",
      }));
    } catch (err) {
      console.error("[TokenDetailsPage] Error fetching candle data => partial chart", err);
    }
  }

  const displaySymbol = foundToken.symbol;
  const [displayName] = foundToken.name.split(":");
  const imageUrl = tokenDetails?.toml_info.image ?? "";

  const priceStr =
    tokenDetails?.price != null
      ? tokenDetails.price.toLocaleString(undefined, { minimumFractionDigits: 2 })
      : "N/A";
  const supplyStr = tokenDetails?.supply != null ? tokenDetails.supply.toLocaleString() : "N/A";
  const volume7dStr = tokenDetails?.volume7d != null ? tokenDetails.volume7d.toLocaleString() : "N/A";
  const tradesStr = tokenDetails?.trades != null ? tokenDetails.trades.toLocaleString() : "N/A";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container max-w-7xl mx-auto px-4 py-6 flex-1 space-y-6">
        {/* Header */}
        <header className="flex items-center gap-2">
          {/* No onClick in server component */}
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 -ml-2 text-muted-foreground"
            title="Go back to tokens list"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Back to Tokens
          </Button>
          {imageUrl && (
            <div
              className="w-10 h-10 rounded-full overflow-hidden relative"
              title={`${displaySymbol} logo`}
            >
              <Image
                src={imageUrl}
                alt={`${displaySymbol} logo`}
                fill
                style={{ objectFit: "cover" }}
                unoptimized
              />
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight">
            {displayName} ({displaySymbol})
          </h1>
        </header>

        {/* Chart period => 14d */}
        <div className="flex justify-end">
          <Select value={chartPeriod} disabled>
            <SelectTrigger className="w-[100px] h-9" title="Selected period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="14d">14D</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Candle Chart */}
        <section
          className="h-[400px] lg:h-[500px] rounded-lg border bg-card overflow-hidden relative"
          aria-label="Price & Volume Chart"
        >
          {chartCandleData.length > 0 ? (
            <ChartComponent candleData={chartCandleData} volumeData={chartVolumeData} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No candle data</p>
              </div>
            </div>
          )}
        </section>

        {/* Token details */}
        {tokenDetails ? (
          <div className="space-y-6" aria-label="Token details and pools">
            <div className="flex flex-wrap gap-4">
              <Card className="flex-1 min-w-[150px]">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">${priceStr}</h3>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[150px]">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Supply</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">{supplyStr}</h3>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[150px]">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Volume (7d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">${volume7dStr}</h3>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[150px]">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">{tradesStr}</h3>
                </CardContent>
              </Card>
            </div>

            {/* Home domain */}
            {tokenDetails.home_domain && (
              <Card>
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Home Domain</CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={`https://${tokenDetails.home_domain}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary hover:underline"
                  >
                    {tokenDetails.home_domain}
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <div>
            <p className="text-muted-foreground">No extra details for this token.</p>
          </div>
        )}

        <TopPools
          data={tokenPools}
          pairs={pairs}
          tokens={tokens}
          stablecoinIds={new Set()}
          period={chartPeriod}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-bold" title={`Pools for ${displayName}`}>
            Pools for {displayName}
          </h2>
          <PoolsTable data={tokenPools} pairs={pairs} tokens={tokens} />
        </div>
      </div>
    </div>
  );
}
