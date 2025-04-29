// data.service.ts

import type {
  GlobalMetrics,
  PoolRiskApiResponseObject,
  Market,
  MarketApiResponseObject,
  Pair,
  PairApiResponseObject,
  Token,
  TokenApiResponseObject,
  AssetDetails,
  TransformedCandleData,
} from "@/utils/types";
import { AllowedPeriods } from "@/utils/utilities";

/**
 * We track a "lastCallTime" so we ensure we wait at least
 * a certain gap (e.g., 350ms => ~3 calls/sec)
 */
const lastCallTime = 0;

/**
 * Converts an ISO date string to a numeric epoch (ms).
 */
export function convertToEpoch(dateStr: string): number {
  return new Date(dateStr).getTime();
}

/**
 * Fetches core data needed by the application: markets, pairs, tokens.
 */
export async function fetchCoreData(): Promise<{
  markets: Market[];
  pairs: Pair[];
  tokens: Token[];
}> {
  const [marketsRes, pairsRes, tokensRes] = await Promise.all([
    fetch("https://api.hoops.finance/markets"),
    fetch("https://api.hoops.finance/pairs"),
    fetch("https://api.hoops.finance/tokens"),
  ]);

  if (!marketsRes.ok || !pairsRes.ok || !tokensRes.ok) {
    throw new Error("Failed to fetch data from backend");
  }

  // Cast .json() results to the known array response types
  const [marketsData, pairsData, tokensData] = (await Promise.all([
    marketsRes.json(),
    pairsRes.json(),
    tokensRes.json(),
  ])) as [MarketApiResponseObject[], PairApiResponseObject[], TokenApiResponseObject[]];
  /*return {
        markets: marketsData,
        pairs: pairsData,
        tokens: tokensData
    }
*/
  /*
    const res = await fetch("/api/data");
    if (!res.ok) throw new Error("Failed to fetch core data");
  
    const { markets: marketsData, pairs: pairsData, tokens: tokensData } = (await res.json()) as {
      markets: MarketApiResponseObject[];
      pairs: PairApiResponseObject[];
      tokens: TokenApiResponseObject[];
    };*/

  // Convert tokens
  const convertedTokens: Token[] = tokensData.map((token) => ({
    ...token,
    id: token._id,
    lastUpdated: convertToEpoch(token.lastUpdated),
  }));

  // Convert pairs
  const convertedPairs: Pair[] = pairsData.map((pair) => ({
    ...pair,
    id: pair._id,
    lastUpdated: convertToEpoch(pair.lastUpdated),
  }));

  // Convert markets
  const tokenMap = new Map(convertedTokens.map((t) => [t.id, t]));
  const pairMap = new Map(convertedPairs.map((p) => [p.id, p]));

  const convertedMarkets: Market[] = marketsData.map((m) => {
    const token0 = tokenMap.get(m.token0);
    const token1 = tokenMap.get(m.token1);
    if (!token0 || !token1) {
      throw new Error(`Token details missing for market: ${m.marketLabel}`);
    }
    let totalTVL = 0;
    const enrichedPools = m.pools.map((poolRef) => {
      const p = pairMap.get(poolRef.pair);
      if (p) {
        totalTVL += p.tvl || 0;
        return p;
      }
      throw new Error(`Pair not found: ${poolRef.pair}`);
    });
    const marketLabel = `${token0.symbol} / ${token1.symbol}`;
    return {
      ...m,
      id: m.marketLabel,
      token0,
      token1,
      pools: enrichedPools,
      marketLabel,
      totalTVL,
    };
  });

  return {
    markets: convertedMarkets,
    pairs: convertedPairs,
    tokens: convertedTokens,
  };
}

/**
 * Fetches period-based data (metrics + pool stats).
 */
export async function fetchPeriodData(period: AllowedPeriods): Promise<{
  globalMetrics: GlobalMetrics | null;
  poolRiskData: PoolRiskApiResponseObject[];
}> {
  const [metricsRes, statsRes] = await Promise.all([
    fetch(`/api/getmetrics?period=${period}`),
    fetch(`/api/getstatistics?period=${period}`),
  ]);

  if (!metricsRes.ok || !statsRes.ok) {
    throw new Error("Failed to fetch period-based data");
  }

  const gm = (await metricsRes.json()) as GlobalMetrics;
  const ps = (await statsRes.json()) as PoolRiskApiResponseObject[];

  return { globalMetrics: gm, poolRiskData: ps };
}

/**
 * Fetches candle data for a single or dual-token chart.
 */
export async function fetchCandles(
  token0: string,
  token1: string | null,
  from: number,
  to: number,
): Promise<TransformedCandleData[]> {
  const normalize = (t: string): string =>
    t.toLowerCase() === "xlm" || t.toLowerCase() === "native" ? "XLM" : t.replace(/:/g, "-");

  const t0 = normalize(token0);
  let endpoint: string;
  if (token1) {
    const t1 = normalize(token1);
    endpoint = `/api/candles/${t0}/${t1}?from=${from}&to=${to}`;
  } else {
    endpoint = `/api/candles/${t0}?from=${from}&to=${to}`;
  }

  const res = await fetch(endpoint);
  if (!res.ok) {
    throw new Error(`Failed to fetch Candles. Status: ${res.status}`);
  }
  return (await res.json()) as TransformedCandleData[];
}

/**
 * Fetches details about a single token (e.g. from /api/tokeninfo).
 */
export async function fetchTokenDetails(asset: string): Promise<AssetDetails | null> {
  const normalized =
    asset.toLowerCase() === "xlm" || asset.toLowerCase() === "native" ? "XLM" : asset.replace(/:/g, "-");
  const res = await fetch(`/api/tokeninfo/${normalized}`);
  if (!res.ok) {
    console.error(`Failed to fetch token details for ${asset}`);
    return null;
  }
  return (await res.json()) as AssetDetails;
}

/**
 * Returns all Pair objects associated with a given token.
 */
export function getPairsForToken(token: Token, pairs: Pair[]): Pair[] {
  const pairMap = new Map<string, Pair>(pairs.map((p) => [p.id, p]));
  const tokenPairsList: Pair[] = [];
  for (const tokenPairPrice of token.pairs) {
    const foundPair = pairMap.get(tokenPairPrice.pairId);
    if (foundPair) {
      tokenPairsList.push(foundPair);
    }
  }
  return tokenPairsList;
}

/**
 * Builds a URL route to a given pool, using the app's conventions.
 */
export function buildPoolRoute(
  pool: PoolRiskApiResponseObject,
  pairs: Pair[],
  tokens: Token[],
  period: AllowedPeriods,
): string {
  // Prepare the common part of the URL
  const protocol = pool.protocol.toLowerCase();
  
  // Helper function to create URL with market name
  const createMarketUrl = () => {
    const urlSafePair = pool.market.replace(/\//g, "-");
    return `/pools/${protocol}/${urlSafePair}?period=${period}&pairId=${pool.pairId}`;
  };

  // Find the pair
  const p = pairs.find((pr) => pr.id === pool.pairId);
  if (!p) {
    return createMarketUrl();
  }

  // Find the tokens
  const t0 = tokens.find((t) => t.id === p.token0);
  const t1 = tokens.find((t) => t.id === p.token1);
  if (!t0 || !t1) {
    return createMarketUrl();
  }

  // Create URL with token names
  const t0Name = t0.name.replace(/:/g, "-");
  const t1Name = t1.name.replace(/:/g, "-");
  return `/pools/${protocol}/${t0Name}-${t1Name}?period=${period}&pairId=${pool.pairId}`;
}