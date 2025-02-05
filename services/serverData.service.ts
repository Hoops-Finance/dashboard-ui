// data.service.ts

import type {
  GlobalMetrics,
  PoolRiskApiResponseObject,
  MetricsResponse,
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
import { UTCTimestamp } from "lightweight-charts";



export async function fetchPeriodDataFromServer(
  period: string
): Promise<{
  globalMetrics: MetricsResponse;
  poolRiskData: PoolRiskApiResponseObject[];
}> {
  const baseUri = "https://api.hoops.finance";

  if (!baseUri) {
    throw new Error("Base data URI is not defined in environment variables.");
  }

  try {
    const [metricsRes, statsRes] = await Promise.all([
      fetch(`${baseUri}/getmetrics?period=${period}`, {
        //cache: "no-store",
      }),
      fetch(`${baseUri}/getstatistics?period=${period}`, {
        // cache: "no-store",
      }),
    ]);

    if (!metricsRes.ok || !statsRes.ok) {
      throw new Error(
        `Failed to fetch data: metrics status ${metricsRes.status}, statistics status ${statsRes.status}`
      );
    }

    const globalMetrics = (await metricsRes.json()) as MetricsResponse;
    const poolRiskData = (await statsRes.json()) as PoolRiskApiResponseObject[];

    return { globalMetrics, poolRiskData };
  } catch (error) {
    console.error("Error fetching period data from server:", error);
    throw error;
  }
}


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
  const [marketsRes, pairsRes, tokensRes] = await Promise.all([fetch("https://api.hoops.finance/markets"), fetch("https://api.hoops.finance/pairs"), fetch("https://api.hoops.finance/tokens")]);

  if (!marketsRes.ok || !pairsRes.ok || !tokensRes.ok) {
    throw new Error("Failed to fetch data from backend");
  }

  // Cast .json() results to the known array response types
  const [marketsData, pairsData, tokensData] = (await Promise.all([marketsRes.json(), pairsRes.json(), tokensRes.json()])) as [
    MarketApiResponseObject[],
    PairApiResponseObject[],
    TokenApiResponseObject[]
  ];

  const convertedTokens: Token[] = tokensData.map((token) => ({
    ...token,
    id: token._id,
    lastUpdated: convertToEpoch(token.lastupdated),
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
 * Fetches candle data for a single or dual-token chart.
 */
export async function fetchCandles(
  token0: string,
  token1: string | null,
  from: number,
  to: number
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
 * Fetch detailed info about a single token from https://api.hoops.finance
 */
export async function fetchTokenDetailsFromServer(asset: string): Promise<AssetDetails> {
  // Convert "native" or "xlm" => "XLM", otherwise replace ":" with "-"
  const normalized =
    asset.toLowerCase() === "native" || asset.toLowerCase() === "xlm"
      ? "XLM"
      : asset.replace(/:/g, "-");

  const url = `https://app.hoops.finance/api/tokeninfo/${normalized}`;
  sleep(200);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Failed to fetch token details for ${asset}, status=${res.status}`);
  }
  return (await res.json()) as AssetDetails;
}

/**
 * Returns all Pair objects associated with a given token.
 */
export function getPairsForToken(token: Token, pairs: Pair[]): Pair[] {
  console.log('getting pairs for token and pairs?', token.name)
  //console.log(JSON.stringify(pairs));
  //console.log(JSON.stringify(token));
  const pairMap = new Map<string, Pair>(pairs.map((p) => [p.id, p]));
  const tokenPairsList: Pair[] = [];
  for (const tokenPairPrice of token.pairs) {
    const foundPair = pairMap.get(tokenPairPrice.pairId);
   // console.log('pair found:', foundPair)
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
  period: AllowedPeriods
): string {
  const p = pairs.find((pr) => pr.id === pool.pairId);
  if (!p) {
    const urlSafePair = pool.market.replace(/\//g, "-");
    return `/pools/${pool.protocol.toLowerCase()}/${urlSafePair}?period=${period}`;
  }
  const t0 = tokens.find((t) => t.id === p.token0);
  const t1 = tokens.find((t) => t.id === p.token1);
  if (!t0 || !t1) {
    const urlSafePair = pool.market.replace(/\//g, "-");
    return `/pools/${pool.protocol.toLowerCase()}/${urlSafePair}?period=${period}`;
  }
  const t0Name = t0.name.replace(/:/g, "-");
  const t1Name = t1.name.replace(/:/g, "-");
  return `/pools/${pool.protocol.toLowerCase()}/${t0Name}-${t1Name}?period=${period}`;
}
/** 
 * We track a "lastCallTime" so we ensure we wait at least 
 * a certain gap (e.g., 350ms => ~3 calls/sec) 
 */
let lastCallTime = 0;
/** Global in-memory cache (keyed by <token0>:<token1>:<from>:<to>). */
const cache = new Map<string, Promise<TransformedCandleData[]>>();

/**
 * Wrapper around `fetchCandlesFromServer` that:
 * 1) Waits if needed so we don't exceed ~2-3 calls/second
 * 2) Caches the results
 * 3) Retries on 429 or 503 (if you want)
 */
export async function fetchCandlesWithRateLimit(
  token0: string,
  token1: string | null,
  from: number,
  to: number
): Promise<TransformedCandleData[]> {
  // 1) Build a cache key
  const cacheKey = `${token0}:${token1 ?? "null"}:${from}:${to}`;
  if (cache.has(cacheKey)) {
    // If there's a promise in the cache, return that promise
    return cache.get(cacheKey)!;
  }

  // 2) We create a new promise that will do the actual fetch
  const promise = (async () => {
    // WAIT for rate-limit: ensure at least 350ms since last call
    const now = Date.now();
    const gap = 350; // ~3 calls/sec
    const wait = lastCallTime + gap - now;
    if (wait > 0) {
      await sleep(wait);
    }
    lastCallTime = Date.now();

    // Optional: implement up to 3 retries on 429 or 503
    let attempts = 3;
    while (attempts > 0) {
      try {
        const data = await fetchCandlesFromServer(token0, token1, from, to);
        return data;
      } catch (err: any) {
        // If error is 429 or 503, we can retry
        if (
          typeof err.message === "string" &&
          (err.message.includes("status=429") || err.message.includes("status=503"))
        ) {
          attempts--;
          if (attempts > 0) {
            // Wait a bit more before retry
            await sleep(1000);
            continue;
          }
        }
        // else it's a real error, throw
        throw err;
      }
    }
    throw new Error("fetchCandlesWithRateLimit: exhausted retries");
  })();

  // 3) Store that promise in cache
  cache.set(cacheKey, promise);

  // 4) Return or remove from cache on error
  //    So that next call can re-fetch if it fails.
  promise.catch(() => {
    cache.delete(cacheKey);
  });

  return promise;
}

/**
 * Fetch candle data for a single or dual-token chart from SXX_API_BASE.
 * We'll replicate the logic that was in your Next.js route files, but do it server-side here.
 */
export async function fetchCandlesFromServer(
  token0: string,
  token1: string | null,
  from: number,
  to: number
): Promise<TransformedCandleData[]> {
  const API_BASE = process.env.SXX_API_BASE || "";
  const API_KEY = process.env.SXX_API_KEY || "";

  // Normalization: "xlm" or "native" => "XLM", else replace ":" with "-"
  function normalizeToken(s: string): string {
    if (!s) return "XLM";
    if (s.toLowerCase() === "native" || s.toLowerCase() === "xlm") return "XLM";
    return s.replace(/:/g, "-");
  }

  const t0 = normalizeToken(token0);
  let fetchUrl: string;

  if (token1) {
    const t1 = normalizeToken(token1);
    // /explorer/public/market/t0/t1/candles
    fetchUrl = `${API_BASE}/explorer/public/market/${t0}/${t1}/candles?from=${from}&to=${to}`;
  } else {
    // /explorer/public/asset/t0/candles
    fetchUrl = `${API_BASE}/explorer/public/asset/${t0}/candles?from=${from}&to=${to}`;
  }

  // Perform the fetch with a Bearer token
  const response = await fetch(fetchUrl, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch candles. URL=${fetchUrl}, status=${response.status}`);
  }

  // CandleDataRaw => [time, open, high, low, baseVol, quoteVol, tradesCount, (maybe more columns?)]
  // We'll replicate your transform logic from the route.
  const rawData = (await response.json()) as Array<[number, number, number, number, number, number, number, number?]>;

  // The route code sets "close" to next candle's open
  return rawData.map((record, index, array) => {
    const nextOpen = index < array.length - 1 ? array[index + 1][1] : record[1];

    return {
      time: record[0] as UTCTimestamp,
      open: record[1],
      high: record[2],
      low: record[3],
      close: nextOpen, // per your route logic
      baseVolume: record[4],
      quoteVolume: record[5],
      tradesCount: record[6],
    };
  });
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

