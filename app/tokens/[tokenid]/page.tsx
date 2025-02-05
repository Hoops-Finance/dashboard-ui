// app/tokens/[tokenid]/page.tsx
//import 'source-map-support/register'

// Instead of:
import sourceMapSupport from 'source-map-support'
sourceMapSupport.install()

import { notFound } from "next/navigation";
import type { AllowedPeriods, CandleDataPoint, VolumeDataPoint } from "@/utils/utilities";
import type { 
  AssetDetails,
  Market, 
  Pair, 
  PoolRiskApiResponseObject, 
  Token 
} from "@/utils/types";
import { 
  fetchCoreData, 
  fetchPeriodDataFromServer, 
  fetchCandlesFromServer, 
  fetchTokenDetailsFromServer, 
  getPairsForToken, 
  fetchCandlesWithRateLimit
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

// 1) Revalidation and dynamic params
export const revalidate = 3600; // Rebuild each token page every hour
export const dynamicParams = true; // On-demand for new tokens

/**
 * Generate the list of tokenid param objects at build time.
 * We produce routes for token.name if it's a valid pattern
 * and token.id if it matches some pattern, plus "native" for XLM.
 */

// app/tokens/[tokenid]/page.tsx

const validNamePattern = /^[A-Z0-9]+-G[A-Z0-9]{55}$/; // e.g. "AQUA-GBNZIL..."
const validIdPattern = /^C[A-Z0-9]{55}$/;             // e.g. "CABC123..."

export async function generateStaticParams() {
  const { tokens } = await fetchCoreData();
  const routes: { tokenid: string }[] = [];

  for (const t of tokens) {
    // 1) If symbol === XLM => "native" route
    if (t.symbol.toUpperCase() === "XLM") {
      routes.push({ tokenid: "native" });
      // Also optionally push contract route if it matches ^C
      if (validIdPattern.test(t.id)) {
        routes.push({ tokenid: t.id });
      }
    }

    // 2) If name looks like "SYMBOL-GISSUER55"
    if (validNamePattern.test(t.name)) {
      const slug = t.name.replace(/:/g, "-"); 
      routes.push({ tokenid: slug });
    }

    // 3) If ID is ^C
    if (validIdPattern.test(t.id)) {
      routes.push({ tokenid: t.id });
    }
  }

  // 4) OPTIONAL: Check each route's tokeninfo. If it 404s, remove it from the final list.
  const verifiedRoutes: { tokenid: string }[] = [];
  for (const r of routes) {
    const normalized = r.tokenid === "native"
      ? "XLM"
      : r.tokenid.replace(/-/g, ":"); // revert slug => "AQUA:GBNZ..."
    if (await checkTokenInfoExists(normalized)) {
      verifiedRoutes.push(r);
    }
    // wait 350ms so we don't exceed 3 requests/second
    await sleep(350);
  }

  console.log("Final verified token routes:", verifiedRoutes);
  return verifiedRoutes;
}

/** HEAD request (or GET) to see if token info is valid. Returns true if OK, false if 404. */
async function checkTokenInfoExists(assetSlug: string): Promise<boolean> {
  const slug = assetSlug.toLowerCase() === "native"
    ? "XLM"
    : assetSlug.replace(/:/g, "-");
  const url = `https://app.hoops.finance/api/tokeninfo/${slug}`;
  const res = await fetch(url, { method: "HEAD" });
  return res.ok;
}

/** Utility sleep function */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Minimal SEO for each route (optional). */
export async function generateMetadata({ params }: { params: { tokenid: string } }) {
  return {
    title: `Token: ${params.tokenid}`,
    description: `Details for token ${params.tokenid}`
  };
}

/**
 * Utility to compute "from" timestamp given an AllowedPeriods string.
 * (Matches your original switch-case from the client side.)
 */
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
      from = to - 7 * 24 * 3600; // fallback
      break;
  }
  return { from, to };
}

/**
 * Server component for a single token's details page, fully rendered on the server.
 */
export default async function TokenDetailsPage({ params }: { params: { tokenid: string } }) {

  // 1) We'll use "14d" as a default period or just pick one
  const period: AllowedPeriods = "14d";

  // 2) Fetch large data sets in parallel
  const [{ tokens, pairs, markets }, { poolRiskData }] = await Promise.all([
    fetchCoreData(),
    fetchPeriodDataFromServer(period),
  ]);

  // 3) Convert route param to actual token name/id 
  let routeParam = params.tokenid;
  if (routeParam === "native") {
    routeParam = "native";
  } else {
    routeParam = routeParam.replace(/-/g, ":");
  }

  // 4) Find the matching token
  const foundToken: Token | undefined = tokens.find((t) => 
    t.symbol.toUpperCase() === "XLM"
      ? routeParam === "native"
      : t.name === routeParam || t.id === routeParam
  );
  if (!foundToken) {
    notFound();
  }

  // 5) Derive pairs and pool data for this token
  const tokenPairs: Pair[] = getPairsForToken(foundToken, pairs);
  const pairIds = new Set(tokenPairs.map((p) => p.id));
  const tokenPools: PoolRiskApiResponseObject[] = poolRiskData.filter((pool) => pairIds.has(pool.pairId));

  // 6) Fetch token details from the server
  
  //if (routeParam !== "native" && routeParam !== "XLM") {
    const tokenDetails = await fetchTokenDetailsFromServer(routeParam);
 // } else {
    // or fetch details for XLM if you have an endpoint for that,
    // or leave null if native doesn't need details
   // tokenDetails = null; 
  //}

  // 7) Fetch candle data (for "14d" period) from the server
  const { from, to } = getTimeRangeForPeriod(period);
  const candlesRaw = await fetchCandlesWithRateLimit(routeParam, null, from, to);

  // Transform candle data if needed
  const candleData: CandleDataPoint[] = candlesRaw.map((c) => ({
    time: c.time as UTCTimestamp,
    open: c.open,
    high: c.high,
    low: c.low,
    close: c.close,
  }));
  const volumeData: VolumeDataPoint[] = candlesRaw.map((c) => ({
    time: c.time as UTCTimestamp,
    value: c.baseVolume,
    color: c.close >= c.open ? "#26a69a" : "#ef5350",
  }));

  // 8) Render the full HTML. All data is known server-side, so this is
  //    an SSR page that search engines can crawl. No client hooks needed.

  const displaySymbol = foundToken.symbol;
  const [displayName] = foundToken.name.split(":");
  const imageUrl = tokenDetails?.toml_info?.image ?? "";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="container max-w-7xl mx-auto px-4 py-6 flex-1 space-y-6">

        {/* Header */}
        <header className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // In a server component, this won't be a client-side action
              // Typically you'd link <Link> to "/tokens" or do a normal anchor
            }}
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
          <h1
            className="text-xl font-bold tracking-tight"
            title={`${displayName} token details`}
          >
            {displayName} ({displaySymbol})
          </h1>
        </header>

        {/* Period label (here we're hardcoding 14d) */}
        <div className="flex justify-end">
          <Select value={period} disabled>
            <SelectTrigger className="w-[100px] h-9" title="Selected period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent align="end">
              <SelectItem value="14d">14D</SelectItem>
              {/* If you want other items, you can add them, but they're disabled in SSR */}
            </SelectContent>
          </Select>
        </div>

        {/* Candle Chart */}
        <section
          className="h-[400px] lg:h-[500px] rounded-lg border bg-card overflow-hidden relative"
          aria-label="Price & Volume Chart"
        >
          {candleData.length > 0 ? (
            <ChartComponent candleData={candleData} volumeData={volumeData} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No candle data</p>
              </div>
            </div>
          )}
        </section>

        {/* Token details if any */}
        {tokenDetails ? (
          <div className="space-y-6" aria-label="Token details and pools">
            <div className="flex flex-wrap gap-4">
              <Card className="flex-1 min-w-[150px]">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">
                    ${tokenDetails.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </h3>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[150px]">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Supply</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">
                    {tokenDetails.supply.toLocaleString()}
                  </h3>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[150px]">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Volume (7d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">
                    ${tokenDetails.volume7d.toLocaleString()}
                  </h3>
                </CardContent>
              </Card>
              <Card className="flex-1 min-w-[150px]">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">
                    {tokenDetails.trades.toLocaleString()}
                  </h3>
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
                    title="Token home domain"
                  >
                    {tokenDetails.home_domain}
                  </a>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          // If no tokenDetails (e.g., it's native XLM?), you can show a fallback:
          <div>
            <p className="text-muted-foreground">No extra details for this token.</p>
          </div>
        )}

        {/* Top Pools */}
        <TopPools
          data={tokenPools}
          pairs={pairs}
          tokens={tokens}
          stablecoinIds={new Set()} // or some stablecoin set
          period={period}
        />

        {/* Pools table */}
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
