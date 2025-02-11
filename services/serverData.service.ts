/**
 * serverData.service.ts
 *
 * Implements a top-down chunk approach, ensuring each chunk is exactly 200 intervals
 * (resolution * 200), and "snaps" both `to` and `from` to multiples of `resolution`.
 *
 * Additional logic:
 *   - We only fetch a chunk if there's at least 5 new intervals beyond the last cached candle.
 *   - We do chunkTo = snappedTo, chunkFrom = chunkTo - resolution*200. If chunkFrom < snappedFrom, set chunkFrom = snappedFrom.
 *   - We keep stepping chunkTo downward until chunkTo < snappedFrom or aggregator returns <200 candles.
 *   - We store only candles after the last known candle in the cache (merge/deduplicate).
 *   - Return final subset [originalFrom..originalTo].
 *
 * [UPDATED] Now we do ascending chunk approach with `?from=<cursor>&resolution=<res>`,
 * no “to” param, returning up to 200 candles from each cursor.
 */

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
import { Mutex } from "async-mutex";
import fs from "fs/promises";
import path from "path";

/**
 * fetchPeriodDataFromServer => get metrics & stats for a chosen period
 */
export async function fetchPeriodDataFromServer(period: string): Promise<{
  globalMetrics: MetricsResponse;
  poolRiskData: PoolRiskApiResponseObject[];
}> {
  const baseUri = process.env.NEXT_PUBLIC_BASE_DATA_URI ?? "https://api.hoops.finance";
  if (!baseUri) {
    throw new Error("Base data URI is not defined in environment variables.");
  }

  try {
    const [metricsRes, statsRes] = await Promise.all([
      fetch(`${baseUri}/getmetrics?period=${period}`),
      fetch(`${baseUri}/getstatistics?period=${period}`),
    ]);

    if (!metricsRes.ok || !statsRes.ok) {
      throw new Error(
        `Failed to fetch data: metrics status ${metricsRes.status}, statistics status ${statsRes.status}`,
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
 * convertToEpoch => parse date string into epoch ms
 */
export function convertToEpoch(dateStr: string): number {
  return new Date(dateStr).getTime();
}

/**
 * fetchCoreData => fetch & parse markets/pairs/tokens
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

  const [marketsData, pairsData, tokensData] = (await Promise.all([
    marketsRes.json(),
    pairsRes.json(),
    tokensRes.json(),
  ])) as [MarketApiResponseObject[], PairApiResponseObject[], TokenApiResponseObject[]];

  const convertedTokens: Token[] = tokensData.map((token) => {
    const tokenc = {
      ...token,
      id: token._id,
      lastUpdated: convertToEpoch(token.lastUpdated),
    };
    return tokenc;
  });

  const convertedPairs: Pair[] = pairsData.map((pair) => ({
    ...pair,
    id: pair._id,
    lastUpdated: convertToEpoch(pair.lastUpdated),
  }));

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
 * fetchCandles => local route for candle data (unchanged)
 * (You can still use /api/candles internally if desired)
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

  console.log("[fetchCandles] local route =>", endpoint);
  const res = await fetch(endpoint);
  if (!res.ok) {
    console.error("[fetchCandles] local route fetch failed with status:", res.status);
    throw new Error(`Failed to fetch Candles. Status: ${res.status}`);
  }
  return (await res.json()) as TransformedCandleData[];
}

/**
 * Candle cache & concurrency lock
 * We'll store them as: candleJsonCache[asset][resolution]
 */
type CandleCache = Partial<Record<string, Partial<Record<string, TransformedCandleData[]>>>>;
let candleJsonCache: CandleCache | null = null;

const candleCacheFile = path.join(process.cwd(), "candlesCache.json");
const candleMutex = new Mutex();

/**
 * loadCandleJsonCache => read candle cache from disk if not already loaded
 */
async function loadCandleJsonCache(): Promise<void> {
  if (candleJsonCache !== null) return;
  try {
    const raw = await fs.readFile(candleCacheFile, "utf-8");
    candleJsonCache = JSON.parse(raw) as CandleCache;
    console.log("[loadCandleJsonCache] loaded existing candle cache from disk");
  } catch {
    candleJsonCache = {};
    console.log("[loadCandleJsonCache] no existing cache file, starting fresh");
  }
}

/**
 * saveCandleJsonCache => writes candle cache to disk
 */
async function saveCandleJsonCache(): Promise<void> {
  if (!candleJsonCache) return;
  try {
    const txt = JSON.stringify(candleJsonCache, null, 2);
    await fs.writeFile(candleCacheFile, txt, "utf-8");
    console.log("[saveCandleJsonCache] saved candle cache to disk");
  } catch (err) {
    console.error("[saveCandleJsonCache] error saving to disk:", err);
  }
}

/**
 * mergeCandleArrays => merges & deduplicates by time
 */
function mergeCandleArrays(
  existing: TransformedCandleData[],
  incoming: TransformedCandleData[],
): TransformedCandleData[] {
  const combined = [...existing, ...incoming];
  combined.sort((a, b) => (a.time as number) - (b.time as number));
  const deduped: TransformedCandleData[] = [];
  let last = -1;
  for (const c of combined) {
    const t = c.time as number;
    if (t !== last) {
      deduped.push(c);
      last = t;
    } else {
      // Overwrite previous entry if same time
      deduped[deduped.length - 1] = c;
    }
  }
  return deduped;
}

/**
 * snapDown => snaps 'val' down to nearest multiple of 'step'
 */
function snapDown(ts: number, step: number): number {
  return Math.floor(ts / step) * step;
}

/**
 * known aggregator resolutions
 */
const knownResolutions = [
  300, // 5 minutes
  900, // 15 minutes
  1800, // 30 minutes
  3600, // 1 hour
  7200, // 2 hours
  14400, // 4 hours
  43200, // 12 hours
  86400, // 1 day
  259200, // 3 days
  604800, // 1 week
  1209600, // 2 weeks
];

/**
 * pickResolution => picks the smallest from knownResolutions such that (to - from)/resolution <= 200
 */
function pickResolution(from: number, to: number): number {
  const span = to - from;
  if (span <= 0) return 300;
  const needed = Math.ceil(span / 200);
  for (const r of knownResolutions) {
    if (r >= needed) return r;
  }
  return knownResolutions[knownResolutions.length - 1];
}

let lastApiCallTime = 0;

/**
 * waitForRateLimit => ensures at least 350ms => we use 450
 */
async function waitForRateLimit(): Promise<void> {
  const now = Date.now();
  const gap = 450;
  const wait = lastApiCallTime + gap - now;
  if (wait > 0) {
    console.log("[waitForRateLimit] sleeping for", wait, "ms");
    await new Promise((r) => setTimeout(r, wait));
  }
  lastApiCallTime = Date.now();
}

// Normalize tokens: if token is "native" or "xlm", return "XLM", else replace ':' with '-'
export function normalizeToken(s: string): string {
  if (!s) return "XLM";
  if (s.toLowerCase() === "native" || s.toLowerCase() === "xlm") return "XLM";
  return s.replace(/:/g, "-");
}

/**
 * fetchCandlesDirect => Makes a direct aggregator call with ?from=<cursor>&resolution=<res>
 * to fetch up to 200 candles starting at the given cursor.
 *
 * If token1 is provided, the URL for a market is used; otherwise, the asset URL is used.
 *
 * @param token0 - The primary asset.
 * @param token1 - The secondary asset (optional).
 * @param cursor - The starting timestamp (in seconds).
 * @param resolution - The resolution in seconds.
 * @returns An array of TransformedCandleData.
 */
async function fetchCandlesDirect(
  token0: string,
  cursor: number,
  resolution: number,
  token1?: string,
): Promise<TransformedCandleData[]> {
  const API_BASE = process.env.SXX_API_BASE ?? "";
  const API_KEY = process.env.SXX_API_KEY ?? "";

  const t0 = normalizeToken(token0);
  let url: string;

  if (token1) {
    const t1 = normalizeToken(token1);
    url = `${API_BASE}/explorer/public/market/${t0}/${t1}/candles?from=${cursor}&resolution=${resolution}`;
    console.log(
      `[fetchCandlesDirect] => from=${cursor}, resolution=${resolution}, token0=${t0}, token1=${t1}`,
    );
  } else {
    url = `${API_BASE}/explorer/public/asset/${t0}/candles?from=${cursor}&resolution=${resolution}`;
    console.log(`[fetchCandlesDirect] => from=${cursor}, resolution=${resolution}, token0=${t0}`);
  }

  console.log(`[fetchCandlesDirect] URL => ${url}`);

  await waitForRateLimit();

  const resp = await fetch(url, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });

  if (resp.status === 429) {
    console.warn("[fetchCandlesDirect] => got 429 => waiting 60s...");
    await new Promise((r) => setTimeout(r, 62000));
    throw new Error("Rate limit 429 => must retry");
  }

  if (!resp.ok) {
    console.error("[fetchCandlesDirect] status=", resp.status, "url=", url);
    throw new Error(`fetchCandlesDirect fail: ${resp.status}, url=${url}`);
  }

  const raw = (await resp.json()) as [number, number, number, number, number, number, number, number?][];
  if (!raw.length) return [];

  return raw.map((record, idx, arr) => {
    const nextOpen = idx < arr.length - 1 ? arr[idx + 1][1] : record[1];
    return {
      time: record[0] as UTCTimestamp,
      open: record[1],
      high: record[2],
      low: record[3],
      close: nextOpen,
      baseVolume: record[4],
      quoteVolume: record[5],
      tradesCount: record[6],
    };
  });
}

/**
 * [EXPORTED] fetchCandlesWithCacheAndRateLimit => ascending chunk approach
 * using only ?from=<cursor>&resolution=<res>.
 *
 * Steps:
 * 1) Pick a resolution so that (originalTo - originalFrom) / resolution <= 200.
 * 2) Snap originalFrom down to the nearest multiple of resolution.
 * 3) Determine the last candle in the cache (if any).
 * 4) Set the cursor to max(last candle time + resolution, snappedFrom).
 * 5) While cursor <= originalTo:
 *    - Fetch up to 200 candles using fetchCandlesDirect.
 *    - Merge them with the cached candles.
 *    - If fewer than 200 candles were returned, break.
 *    - Otherwise, set cursor to last candle time + resolution.
 * 6) Save the updated cache and return only the candles between originalFrom and originalTo.
 *
 * @param token0 - The primary asset (string).
 * @param originalFrom - The start epoch (in seconds).
 * @param originalTo - The end epoch (in seconds).
 * @param token1? - The (optional) secondary asset (string) or null.
 * @returns An array of TransformedCandleData.
 */
export async function fetchCandlesWithCacheAndRateLimit(
  token0: string,
  originalFrom: number,
  originalTo: number,
  token1?: string,
): Promise<TransformedCandleData[]> {
  console.log(
    "[fetchCandlesWithCacheAndRateLimit] ascending =>",
    token0,
    token1,
    originalFrom,
    originalTo,
  );

  return candleMutex.runExclusive(async () => {
    await loadCandleJsonCache();
    if (!candleJsonCache) {
      candleJsonCache = {};
    }
    const t0 = normalizeToken(token0);
    const assetKey = token1 ? `${t0}:${normalizeToken(token1)}` : t0;

    // Pick a resolution based on the requested time span.
    const resolution = pickResolution(originalFrom, originalTo);
    const resolutionStr = String(resolution);

    // Snap the 'from' value downward so intervals align.
    const snappedFrom = snapDown(originalFrom, resolution);

    // Ensure there is a sub-object in the cache for this assetKey.
    if (!candleJsonCache[assetKey]) {
      candleJsonCache[assetKey] = {};
    }
    let existing = candleJsonCache[assetKey][resolutionStr] ?? [];
    existing.sort((a, b) => (a.time as number) - (b.time as number));

    // Determine the time of the last cached candle.
    const haveMax = existing.length
      ? (existing[existing.length - 1].time as number)
      : snappedFrom - resolution;

    // Set the initial cursor.
    let cursor = Math.max(haveMax + resolution, snappedFrom);

    // Fetch new chunks until we've covered the requested time range.
    while (cursor <= originalTo) {
      console.log(`[fetchCandlesWithCacheAndRateLimit] chunk => from=${cursor}, res=${resolution}`);

      let chunk: TransformedCandleData[] = [];
      try {
        if (token1) {
          const t1 = normalizeToken(token1);
          const t0 = normalizeToken(token0);
          chunk = await fetchCandlesDirect(t0, cursor, resolution, t1);
        } else {
          const t0 = normalizeToken(token0);
          chunk = await fetchCandlesDirect(t0, cursor, resolution);
        }
      } catch (err) {
        console.error("[fetchCandlesWithCacheAndRateLimit] fetch error =>", err);
        break;
      }

      if (!chunk.length) {
        console.log("[fetchCandlesWithCacheAndRateLimit] => no new data => done");
        break;
      }

      // Merge the new chunk with the cached data.
      const beforeCount = existing.length;
      existing = mergeCandleArrays(existing, chunk);
      const afterCount = existing.length;

      console.log(
        `[fetchCandlesWithCacheAndRateLimit] => chunk had ${chunk.length} candles, merged +${afterCount - beforeCount} new`,
      );

      // If fewer than 200 candles were returned, assume we've fetched the remainder.
      if (chunk.length < 200) {
        console.log("[fetchCandlesWithCacheAndRateLimit] aggregator returned <200 => done");
        break;
      }

      // Set the next cursor from the last candle.
      const lastTime = chunk[chunk.length - 1].time as number;
      const nextCursor = lastTime + resolution;

      if (nextCursor <= cursor) {
        console.warn("[fetchCandlesWithCacheAndRateLimit] no forward progress => break");
        break;
      }
      cursor = nextCursor;
    }

    // Update the cache.
    candleJsonCache[assetKey][resolutionStr] = existing;
    await saveCandleJsonCache();

    // Filter the results to return only the candles within the requested time range.
    const finalSubset = existing.filter((c) => {
      const t = c.time as number;
      return t >= originalFrom && t <= originalTo;
    });

    console.log(
      `[fetchCandlesWithCacheAndRateLimit] final => ${finalSubset.length} items, resolution=${resolution}, asset=${assetKey}`,
    );

    return finalSubset;
  });
}

/**
 * Token info caching with optional HEAD mode
 */
type TokenInfoCache = Record<string, { data: AssetDetails; fetchedAt: number } | undefined> | null;
let tokenInfoCache: TokenInfoCache = null;
const tokenInfoCacheFile = path.join(process.cwd(), "tokenInfoCache.json");
/**
 * loadTokenInfoCache => read token info cache from disk if not loaded
 */
async function loadTokenInfoCache(): Promise<void> {
  if (tokenInfoCache !== null) return;
  try {
    const raw = await fs.readFile(tokenInfoCacheFile, "utf-8");
    tokenInfoCache = JSON.parse(raw) as Record<string, { data: AssetDetails; fetchedAt: number }>;
    console.log("[loadTokenInfoCache] loaded existing token info cache from disk");
  } catch {
    tokenInfoCache = {};
    console.log("[loadTokenInfoCache] no existing token info cache file, starting fresh");
  }
}

/**
 * saveTokenInfoCache => writes token info cache to disk
 */
async function saveTokenInfoCache(): Promise<void> {
  if (!tokenInfoCache) return;
  try {
    const txt = JSON.stringify(tokenInfoCache, null, 2);
    await fs.writeFile(tokenInfoCacheFile, txt, "utf-8");
    console.log("[saveTokenInfoCache] saved token info cache to disk");
  } catch (err) {
    console.error("[saveTokenInfoCache] error saving token info to disk:", err);
  }
}

/**
 * fetchTokenDetailsWithCache => optional HEAD-based check or GET
 */
export async function fetchTokenDetailsWithCache(
  asset: string,
  headMode?: boolean,
): Promise<AssetDetails | boolean | null> {
  const normalized =
    asset.toLowerCase() === "native" || asset.toLowerCase() === "xlm" ? "XLM" : asset.replace(/:/g, "-");

  await loadTokenInfoCache();

  if (headMode) {
    const c = tokenInfoCache?.[normalized];
    if (c) {
      const ageMs = Date.now() - c.fetchedAt;
      console.log(
        `[fetchTokenDetailsWithCache] HEAD => already have cache for ${normalized}, age=${ageMs}ms => skipping HEAD`,
      );
      return true;
    }
    const url = `https://app.hoops.finance/api/tokeninfo/${normalized}`;
    console.log("[fetchTokenDetailsWithCache] HEAD =>", url);
    await waitForRateLimit();
    let headRes: Response;
    try {
      headRes = await fetch(url, { method: "HEAD" });
    } catch (err) {
      console.error("[fetchTokenDetailsWithCache] HEAD => error => skip route", err);
      return false;
    }
    if (!headRes.ok) {
      if (headRes.status === 404) {
        console.warn("[fetchTokenDetailsWithCache] HEAD => 404 => skip");
        return false;
      } else if (headRes.status === 429 || headRes.status === 503) {
        console.warn(
          `[fetchTokenDetailsWithCache] HEAD => ${headRes.status} => waiting 60s then proceed`,
        );
        await new Promise((r) => setTimeout(r, 60000));
        return true;
      }
      console.warn("[fetchTokenDetailsWithCache] HEAD => Not 200:", headRes.status, "=> skip");
      return false;
    }
    return true;
  }

  if (!tokenInfoCache) {
    tokenInfoCache = {};
  }

  const existing = tokenInfoCache[normalized];
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  if (existing) {
    const age = now - existing.fetchedAt;
    if (age < oneDayMs) {
      console.log(`[fetchTokenDetailsWithCache] using cached data for ${normalized}, age=${age}ms`);
      return existing.data;
    }
  }

  const url = `https://app.hoops.finance/api/tokeninfo/${normalized}`;
  console.log("[fetchTokenDetailsWithCache] GET =>", url);
  await waitForRateLimit();

  let res: Response;
  try {
    res = await fetch(url);
  } catch (err) {
    console.error("[fetchTokenDetailsWithCache] GET => error => returning false:", err);
    return false;
  }
  if (!res.ok) {
    console.warn("[fetchTokenDetailsWithCache] GET => not 200, status=", res.status);
    return false;
  }
  const data = (await res.json()) as AssetDetails;
  tokenInfoCache[normalized] = { data, fetchedAt: now };
  await saveTokenInfoCache();

  return data;
}

/**
 * getPairsForToken => returns all pairs referencing the provided token
 */
export function getPairsForToken(token: Token, pairs: Pair[]): Pair[] {
  console.log("getting pairs for token and pairs?", token.name);
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
 * buildPoolRoute => generate a route for the given pool
 */
export function buildPoolRoute(
  pool: PoolRiskApiResponseObject,
  pairs: Pair[],
  tokens: Token[],
  period: AllowedPeriods,
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
 * We track a "lastCallTime" so we ensure at least 350ms => ~3 calls/sec
 */
let lastCallTime2 = 0;

/**
 * Global in-memory cache (keyed by <token0>:<token1>:<from>:<to>)
 * for the older approach
 */
const cache = new Map<string, Promise<TransformedCandleData[]>>();

/**
 * [EXPORTED] fetchCandlesWithRateLimit => older approach (unchanged).
 */
export async function fetchCandlesWithRateLimit(
  token0: string,
  token1: string | null,
  from: number,
  to: number,
): Promise<TransformedCandleData[]> {
  const cacheKey = `${token0}:${token1 ?? "null"}:${from}:${to}`;
  if (cache.has(cacheKey)) {
    console.log("[fetchCandlesWithRateLimit] cache hit for", cacheKey);
    const cachedPromise = cache.get(cacheKey);
    if (cachedPromise !== undefined) {
      return cachedPromise;
    }
  }
  console.log("[fetchCandlesWithRateLimit] cache miss for", cacheKey);

  const promise = (async () => {
    const now = Date.now();
    const gap = 350;
    const wait = lastCallTime2 + gap - now;
    if (wait > 0) {
      console.log("[fetchCandlesWithRateLimit] sleeping", wait, "ms for rate-limit");
      await new Promise((r) => setTimeout(r, wait));
    }
    lastCallTime2 = Date.now();

    let attempts = 3;
    while (attempts > 0) {
      try {
        const data = await fetchCandlesFromServer(token0, token1, from, to);
        console.log(
          "[fetchCandlesWithRateLimit] fetched",
          data.length,
          "candles from server for",
          token0,
          token1,
        );
        return data;
      } catch (err: unknown) {
        const e = err as Error;
        console.warn("[fetchCandlesWithRateLimit] fetch attempt failed:", e.message);
        if (e.message.includes("status=429") || e.message.includes("status=503")) {
          attempts--;
          if (attempts > 0) {
            console.log("[fetchCandlesWithRateLimit] retrying after 1s...");
            await new Promise((r) => setTimeout(r, 1000));
            continue;
          }
        }
        console.error("[fetchCandlesWithRateLimit] final error => returning empty array:", e);
        return [];
      }
    }
    return [];
  })();

  cache.set(cacheKey, promise);

  promise.catch(() => {
    cache.delete(cacheKey);
  });

  return promise;
}

/**
 * fetchCandlesFromServer => direct call with (token0, token1, from, to)
 * used by fetchCandlesWithRateLimit
 */
export async function fetchCandlesFromServer(
  token0: string,
  token1: string | null,
  from: number,
  to: number,
): Promise<TransformedCandleData[]> {
  const API_BASE = process.env.SXX_API_BASE ?? "";
  const API_KEY = process.env.SXX_API_KEY ?? "";

  function normalizeToken(s: string): string {
    if (!s) return "XLM";
    if (s.toLowerCase() === "native" || s.toLowerCase() === "xlm") return "XLM";
    return s.replace(/:/g, "-");
  }

  const t0 = normalizeToken(token0);
  let fetchUrl: string;

  if (token1) {
    const t1 = normalizeToken(token1);
    fetchUrl = `${API_BASE}/explorer/public/market/${t0}/${t1}/candles?from=${from}&to=${to}`;
  } else {
    fetchUrl = `${API_BASE}/explorer/public/asset/${t0}/candles?from=${from}&to=${to}`;
  }

  console.log("[fetchCandlesFromServer] =>", fetchUrl);
  const response = await fetch(fetchUrl, {
    headers: { Authorization: `Bearer ${API_KEY}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch candles. URL=${fetchUrl}, status=${response.status}`);
  }

  const rawData = (await response.json()) as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
    number?,
  ][];
  return rawData.map((record, index, array) => {
    const nextOpen = index < array.length - 1 ? array[index + 1][1] : record[1];
    return {
      time: record[0] as UTCTimestamp,
      open: record[1],
      high: record[2],
      low: record[3],
      close: nextOpen,
      baseVolume: record[4],
      quoteVolume: record[5],
      tradesCount: record[6],
    };
  });
}

/**
 * sleep => basic delay
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
