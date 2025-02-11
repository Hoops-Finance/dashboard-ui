// /app/pools/[protocol]/[pairid]/page.tsx

import PoolPageClient from "./PoolPageClient";
import {
  fetchPeriodDataFromServer,
  fetchCoreData,
  fetchCandlesWithCacheAndRateLimit,
} from "@/services/serverData.service";
import type { UTCTimestamp } from "lightweight-charts";
import type { AllowedPeriods } from "@/utils/utilities";

// Enable ISR – revalidate this page every 60 seconds.
export const revalidate = 60;

/**
 * Helper to compute the time range for a given period.
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
      from = to - 7 * 24 * 3600;
  }
  return { from, to };
}

/**
 * generateStaticParams – (example implementation)
 *
 * Here you reverse–engineer your pool routes from your poolRiskData, pairs and tokens.
 * Adjust the logic as needed.
 */
export async function generateStaticParams() {
  const defaultPeriod: AllowedPeriods = "14d";
  const { poolRiskData } = await fetchPeriodDataFromServer(defaultPeriod);
  const { pairs, tokens } = await fetchCoreData();

  const routesSet = new Set<string>();
  const routes: { protocol: string; pair: string }[] = [];

  for (const pool of poolRiskData) {
    const protocol = pool.protocol.toLowerCase();
    let pairId: string;
    // Try to find the pair details using pool.pairId.
    const p = pairs.find((pr) => pr.id === pool.pairId);
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
 * generateMetadata – (example implementation)
 */
export async function generateMetadata({ params }: { params: { protocol: string; pair: string } }) {
  return {
    title: `Pool: ${params.protocol} – ${params.pair}`,
    description: `Details for pool ${params.protocol} with pair ${params.pair}.`,
  };
}

/**
 * Main server component.
 * It fetches pool data and candle data (using fetchCandlesWithCacheAndRateLimit, now updated to accept two tokens),
 * transforms the candle data, and passes everything to the client component.
 */
export default async function PoolPage({ params }: { params: { protocol: string; pair: string } }) {
  const defaultPeriod: AllowedPeriods = "14d";
  const { poolRiskData } = await fetchPeriodDataFromServer(defaultPeriod);
  const { pairs, tokens } = await fetchCoreData();

  // Parse the "pair" parameter into token names (same logic as your client code)
  const pairParam = params.pair;
  let token0Name: string, token1Name: string;
  const parts = pairParam.split("-");
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

  return (
    <PoolPageClient
      params={params}
      period={defaultPeriod}
      poolRiskData={poolRiskData}
      pairs={pairs}
      tokens={tokens}
      candleData={chartCandleData}
      volumeData={chartVolumeData}
    />
  );
}
