// app/tokens/[tokenid]/page.tsx

import { notFound } from "next/navigation";
import {
  ALL_PERIODS,
  getTimeRangeForPeriod,
  hslToHex,
  sleep,
  type AllowedPeriods,
  type CandleDataPoint,
  type VolumeDataPoint,
} from "@/utils/utilities";
import type { AssetDetails, Market, Pair, PoolRiskApiResponseObject, Token } from "@/utils/types";

import {
  fetchCoreData,
  fetchPeriodDataFromServer,
  getPairsForToken,
  fetchTokenDetailsWithCache,
  fetchCandlesWithCacheAndRateLimit,
  normalizeToken,
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
import Link from "next/link";
import { getCachedRoutes } from "@/lib/routeCache";
import { generatePairRoutes } from "@/app/pools/[protocol]/[pair]/page";

export const revalidate = 86400;
export const dynamicParams = true;

const validNamePattern = /^[A-Z0-9]+-G[A-Z0-9]{55}$/;
const validIdPattern = /^C[A-Z0-9]{55}$/;

/** Limit final routes to 10 */
const MAX_ROUTES = 1000;

export async function generateTokenRoutes() {
  const { tokens } = await fetchCoreData();
  const routes: { tokenid: string }[] = [];

  const addedRoutes = new Set<string>();
  //console.error('[generateStaticParams] tokens', tokens);

  for (const token of tokens) {
    console.log("[generateStaticParams] running for", token.name, token.id, token.symbol);
    // (1) Always add the token id route.
    if (!addedRoutes.has(token.id)) {
      console.log("[generateStaticParams] adding contract route", token.id);
      routes.push({ tokenid: token.id });
      addedRoutes.add(token.id);
    }

    // (2) For XLM, add "native" route.
    if (token.symbol.toUpperCase() === "XLM" && !addedRoutes.has("native")) {
      console.log("[generateStaticParams] adding native route");
      routes.push({ tokenid: "native" });
      addedRoutes.add("native");
    }

    // (3) Build an alias route.
    let alias: string;
    if (token.symbol.toUpperCase() !== "XLM") {
      if (token.name.includes(":")) {
        // If the name contains ":", replace it with "-".
        alias = token.name.replace(/:/g, "-");
      } else {
        // Otherwise, use an alternative alias in case it is a custom token.
        alias = `${token.symbol}-${token.id}`;
      }
      if (!addedRoutes.has(alias)) {
        console.log("[generateStaticParams] adding alias route", alias);
        routes.push({ tokenid: alias });
        addedRoutes.add(alias);
      }
    }
  }

  const verifiedRoutes: { tokenid: string }[] = [];
  const headCheckedAssets = new Map<string, boolean>();

  for (const route of routes) {
    const tokenIdentifier = normalizeToken(route.tokenid);

    // Reuse HEAD result if we already checked this asset
    if (headCheckedAssets.has(tokenIdentifier)) {
      if (headCheckedAssets.get(tokenIdentifier)) {
        verifiedRoutes.push(route);
      } else {
        console.warn(`[generateStaticParams] have cache but failed hit for ${route.tokenid}`);
      }
    } else {
      const result = await fetchTokenDetailsWithCache(tokenIdentifier, tokens);
      headCheckedAssets.set(tokenIdentifier, true);
      verifiedRoutes.push(route);
      await sleep(350);
    }

    if (verifiedRoutes.length >= MAX_ROUTES) {
      console.log("[generateStaticParams] Reached MAX_ROUTES limit of", MAX_ROUTES);
      break;
    }
  }

  console.log("Final verified token routes:", verifiedRoutes);
  return verifiedRoutes;
}
/**
 * generateStaticParams => produce *two* routes if possible:
 *  - contract ID: (C[...])
 *  - token.name (SYMBOL-ISSUER) or "native" if XLM
 */

export async function generateStaticParams() {
  const { tokenRoutes } = await getCachedRoutes(generateTokenRoutes, generatePairRoutes);
  return tokenRoutes;
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
    openGraph: {
      images: [`https://example.com/tokens/${tokenid}/opengraph-image`],
    },
    twitter: {
      images: [`https://example.com/tokens/${tokenid}/opengraph-image`],
    },
  };
}

/**
 * The main server component for a single token's details page
 */
export default async function TokenDetailsPage({ params }: { params: Promise<{ tokenid: string }> }) {
  const classicAssetRegex = /^[A-Z0-9]{3,12}-G[A-Z0-9]{55}(?:-\d+)?$/;
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

  const foundToken: Token | undefined = tokens.find((token) =>
    token.symbol.toUpperCase() === "XLM"
      ? routeParam === "native"
      : token.name === routeParam || token.id === routeParam,
  );
  if (!foundToken) {
    console.warn("[TokenDetailsPage] No matching token found => notFound()", routeParam);
    notFound();
  }

  const isPoolShare =
    foundToken.name.includes("Pool Share Token") ||
    foundToken.name.includes("LP Token") ||
    foundToken.symbol.includes("POOL");

  const tokenPairs: Pair[] = getPairsForToken(foundToken, pairs);
  const pairIds = new Set(tokenPairs.map((p) => p.id));
  const tokenPools: PoolRiskApiResponseObject[] = poolRiskData.filter((pool) =>
    pairIds.has(pool.pairId),
  );

  // [ADDED] fetch the tokeninfo => get "asset" which might be "AQUA-GBNZ...-1"
  let tokenDetails: AssetDetails | null = null;
  let classicAssetString;
  try {
    const result = await fetchTokenDetailsWithCache(routeParam, tokens);
    // console.log("[TokenDetailsPage] tokeninfo result", result);
    tokenDetails = result;

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
  } catch (err) {
    console.error("[TokenDetailsPage] error loading token info => partial page", err);
  }

  // If it's not a Pool Share token, we prefetch candle data for all periods
  // using the final "classicAssetString" string
  if (!isPoolShare && classicAssetString && classicAssetRegex.test(classicAssetString)) {
    for (const p of ALL_PERIODS) {
      const { from, to } = getTimeRangeForPeriod(p);
      try {
        await fetchCandlesWithCacheAndRateLimit(classicAssetString, from, to);
      } catch (err) {
        console.error("[TokenDetailsPage] prefetch error for", p, err);
      }
    }
  } else {
    console.log(
      "[TokenDetailsPage] Skipping candle prefetch because classicAssetString is invalid:",
      classicAssetString,
    );
  }

  // We'll show chartPeriod=14d
  let chartCandleData: CandleDataPoint[] = [];
  let chartVolumeData: VolumeDataPoint[] = [];
  if (!isPoolShare && classicAssetString && classicAssetRegex.test(classicAssetString)) {
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
      // Compute maximum volume in the current dataset (avoid division by zero)
      const maxVolume = Math.max(...raw.map((c) => c.baseVolume), 1);

      // 1) Compute volume differences for each candle.
      // For candle i (i>0): Δ_i = volume_i - volume_{i-1}
      // For candle 0, default to 0 or any fallback you prefer.
      const volumeDiffs = raw.map((c, i) => {
        if (i === 0) return 0; // fallback for the first candle
        return raw[i].baseVolume - raw[i - 1].baseVolume;
      });

      // 2) Find min/max difference
      const minDiff = volumeDiffs.length > 1 ? Math.min(...volumeDiffs) : 0;
      const maxDiff = volumeDiffs.length > 1 ? Math.max(...volumeDiffs) : 0;

      // 3) Build the volume data series
      chartVolumeData = raw.map((c, i) => {
        const diff = volumeDiffs[i]; // difference for candle i
        let normalizedDiff = 0.5; // default fallback

        // Only normalize if we actually have a range
        if (maxDiff !== minDiff) {
          normalizedDiff = (diff - minDiff) / (maxDiff - minDiff);
        }

        // 4) Map normalizedDiff [0..1] to lightness [30..70]
        const lightness = 30 + normalizedDiff * 40; // 30% to 70%

        // 5) Hue is green if diff >= 0, red if diff < 0
        const hue = diff >= 0 ? 120 : 0;

        // Convert to hex
        const color = hslToHex({ h: hue, s: 100, l: lightness });

        return {
          time: c.time,
          value: c.baseVolume, // or c.quoteVolume, if you prefer
          color,
        };
      });
    } catch (err) {
      console.error("[TokenDetailsPage] Error fetching candle data => partial chart", err);
    }
  } else {
    console.log(
      "[TokenDetailsPage] Skipping chart candle fetch because classicAssetString is invalid:",
      classicAssetString,
    );
  }

  const displaySymbol = foundToken.symbol;
  const [displayName] = foundToken.name.split(":");
  const imageUrl = tokenDetails?.toml_info?.image ?? "";

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
          <Link href="/tokens">
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 -ml-2 text-muted-foreground"
              title="Go back to tokens list"
            >
              <ChevronRight className="h-4 w-4 rotate-180" />
              Back to Tokens
            </Button>
          </Link>
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
          <Select value={chartPeriod}>
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
