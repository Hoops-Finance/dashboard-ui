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
 * snapCandle => force candle's time to align with the chosen resolution
 */
function snapCandle(candle: TransformedCandleData, resolution: number): TransformedCandleData {
  return { ...candle, time: snapDown(candle.time as number, resolution) as UTCTimestamp };
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
  const gap = 3000;
  const wait = lastApiCallTime + gap - now;
  if (wait > 0) {
    console.log("[waitForRateLimit] sleeping for", wait, "ms");
    await new Promise((r) => setTimeout(r, wait));
  }
  lastApiCallTime = Date.now();
}

// Normalize tokens: if token is "native" or "xlm", return "XLM", else replace ':' with '-'
export function normalizeToken(s: string): string {
  const contractPattern = /^C[A-Z0-9]{55}$/;
  const XLM_CONTRACT = "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA";

  // If the entire string is the special XLM contract (case-insensitive), return "XLM"
  if (s.toUpperCase() === XLM_CONTRACT) return "XLM";

  // If the token is exactly "native" or "xlm" (case-insensitive), return "XLM"
  const lower = s.toLowerCase();
  if (lower === "native" || lower === "xlm") return "XLM";

  // Split the token on both ":" and "-" and check each segment.
  const parts = s.split(/[:\-]/);
  for (const part of parts) {
    const trimmed = part.trim();
    if (contractPattern.test(trimmed)) {
      if (trimmed === XLM_CONTRACT) return "XLM"; // Special case for XLM contract
      return trimmed;
    }
  }

  // If no valid contract address is found, replace colons with dashes.
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
    // -------------------------------------------------------------------
    //  If there's fewer than 5 intervals' worth of new data between haveMax and originalTo,
    //  we skip external fetch to avoid small, frequent calls.
    //  -------------------------------------------------------------------
    if (originalTo - haveMax < resolution * 5) {
      console.log("[fetchCandlesWithCacheAndRateLimit] Not enough new intervals => skipping fetch");
      const finalSubset = existing.filter((candle) => {
        const timestamp = candle.time as number;
        return timestamp >= originalFrom && timestamp <= originalTo;
      });
      return finalSubset;
    }

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
      // snap the candles to align.
      chunk = chunk.map((c) => snapCandle(c, resolution));
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

async function buildBasicDetails(localToken: Token, assetIdentifier: string): Promise<AssetDetails> {
  const basicDetails: AssetDetails = {
    asset: assetIdentifier,
    contract: localToken.id,
    toml_info: {
      code: localToken.symbol,
      issuer: localToken.id, // later the issuer should probably be the address that deployed the pool i'm not sure. for now it's just it's self.
      name: localToken.name,
      image: localToken.logoUrl ?? "",
      anchorAssetType: "",
      anchorAsset: "",
      orgName: "",
      orgLogo: "",
    },
  };
  return basicDetails;
}

async function getToken(assetIdentifier: string, tokens: Token[]): Promise<Token> {
  try {
    const contractPattern = /^C[A-Z0-9]{55}$/;
    const XLM_CONTRACT = "CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA";
    const trimmed = assetIdentifier.trim();

    // Step 0: If the entire string equals "xlm", "native", or the XLM contract address.
    if (
      trimmed.toLowerCase() === "xlm" ||
      trimmed.toLowerCase() === "native" ||
      trimmed.toUpperCase() === XLM_CONTRACT
    ) {
      const xlmToken = tokens.find((token) => token.id.toUpperCase() === XLM_CONTRACT);
      if (xlmToken) return xlmToken;
    }

    // Step 1: Split the identifier on ":" or "-" and trim each part.
    const parts = trimmed.split(/[:\-]/).map((p) => p.trim());

    // Step 2: If any part equals "xlm", "native", or the XLM contract address, return the XLM token.
    if (
      parts.some(
        (part) =>
          part.toLowerCase() === "xlm" ||
          part.toLowerCase() === "native" ||
          part.toUpperCase() === XLM_CONTRACT,
      )
    ) {
      const xlmToken = tokens.find((token) => token.id.toUpperCase() === XLM_CONTRACT);
      if (xlmToken) return xlmToken;
    }

    // Step 3: Direct match on the entire identifier against token.id or token.name.
    let foundToken = tokens.find(
      (token) =>
        token.id.toUpperCase() === trimmed.toUpperCase() ||
        token.name.toLowerCase() === trimmed.toLowerCase(),
    );
    if (foundToken) return foundToken;

    // Step 4: Look for a valid contract candidate in the split parts.
    const contractCandidate = parts.find((part) => contractPattern.test(part.toUpperCase()));
    if (contractCandidate) {
      foundToken = tokens.find((token) => token.id.toUpperCase() === contractCandidate.toUpperCase());
      if (foundToken) return foundToken;
    }

    // Step 5: If there are exactly 2 parts, assume symbol and issuer format.
    if (parts.length === 2) {
      const normalizedAssetName = parts.join("-").toLowerCase();
      foundToken = tokens.find(
        (token) => token.name.replace(/:/g, "-").toLowerCase() === normalizedAssetName,
      );
      if (foundToken) return foundToken;
    } else {
      // Step 6: Otherwise, normalize the entire identifier by replacing colons with dashes.
      const normalizedAssetIdentifier = trimmed.replace(/:/g, "-").toLowerCase();
      foundToken = tokens.find(
        (token) => token.name.replace(/:/g, "-").toLowerCase() === normalizedAssetIdentifier,
      );
      if (foundToken) return foundToken;
    }

    console.log(`[fetchTokenDetailsWithCache] No matching token found for ${assetIdentifier}`);
    throw new Error(`No matching token found for ${assetIdentifier}`);
  } catch (error) {
    console.warn(`[fetchTokenDetailsWithCache] Error finding token: ${error}`);
    throw error;
  }
}

async function mergeTokenDetails(localToken: Token, externalData: AssetDetails): Promise<AssetDetails> {
  // Merge localToken info.
  console.log(`[fetchTokenDetailsWithCache] Merging local data for ${localToken.name}`);
  if ((externalData.price == null || externalData.price === 0) && localToken.price > 0) {
    externalData.price = localToken.price;
    console.log(
      `[fetchTokenDetailsWithCache] Using local price for ${localToken.name}: ${localToken.price}`,
    );
  }
  if (!externalData.toml_info) {
    externalData.toml_info = {
      code: localToken.symbol,
      issuer: "",
      name: localToken.name,
      image: localToken.logoUrl ?? "",
      anchorAssetType: "",
      anchorAsset: "",
      orgName: "",
      orgLogo: "",
    };
    console.log(`[fetchTokenDetailsWithCache] Created basic toml_info for ${localToken.name}`);
  }
  return externalData;
}

/**
 * fetchTokenDetailsWithCache => optional HEAD-based check or GET
 */
export async function fetchTokenDetailsWithCache(asset: string, tokens: Token[]): Promise<AssetDetails> {
  // Normalize asset string: if "native" or "xlm", return "XLM", else replace ':' with '-'
  const assetIdentifier = normalizeToken(asset);
  console.log(`[fetchTokenDetailsWithCache] Normalized asset: ${asset} => ${assetIdentifier}`); // log if there was a change.

  const localToken = await getToken(assetIdentifier, tokens);
  console.log(
    `[fetchTokenDetailsWithCache] Found raw token info from db: ${localToken.name} (${localToken.id})`,
  );
  console.log(`[fetchTokenDetailsWithCache] Local token info: ${JSON.stringify(localToken)}`);

  // Check for tokens that we know won't have external token details, derive them from what we can currently get, then return that info.
  if (
    localToken.name.includes("Pool Share Token") ||
    localToken.symbol.toUpperCase().includes("POOL") ||
    localToken.name.toLowerCase().includes("LP Token")
  ) {
    console.log(
      `[fetchTokenDetailsWithCache] Skipping external fetch for ${localToken.name} (${localToken.id}) as it has no details.`,
    );
    console.log(`[fetchTokenDetailsWithCache] Returning basic details for ${localToken.name}`);
    const basicDetails = await buildBasicDetails(localToken, assetIdentifier);
    return basicDetails;
  }

  // Load the cache from disk (if not already loaded)
  await loadTokenInfoCache();
  if (!tokenInfoCache) {
    tokenInfoCache = {};
    console.log(`[fetchTokenDetailsWithCache] Initialized New tokenInfoCache`);
  }
  console.log(
    `[fetchTokenDetailsWithCache] Initialized tokenInfoCache with ${JSON.stringify(tokenInfoCache).length} entries`,
  );

  const cacheHit = tokenInfoCache[assetIdentifier];
  const now = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;

  if (cacheHit) {
    const age = now - cacheHit.fetchedAt;
    if (age < oneDayMs) {
      console.log(`[fetchTokenDetailsWithCache] using cacheHit for ${assetIdentifier}, age=${age}ms`);
      return cacheHit.data;
    } else {
      console.log(`[fetchTokenDetailsWithCache] expired cacheHit for ${assetIdentifier}, age=${age}ms`);
    }
  }

  // update the cache if we must.
  // Build the URL for a GET request using the assetIdentifier.
  const url = `https://app.hoops.finance/api/tokeninfo/${assetIdentifier}`;
  console.log(`[fetchTokenDetailsWithCache] GET => ${url}`);
  await waitForRateLimit();

  let res: Response;
  try {
    res = await fetch(url);
    console.log(`[fetchTokenDetailsWithCache] Received response with status ${res.status}`);
  } catch (err) {
    console.error("[fetchTokenDetailsWithCache] GET => error:", err);
    console.log("[fetchTokenDetailsWithCache] Attempting fallback...");
    return await tryFallback(asset, tokens, assetIdentifier, now);
  }
  while (res.status === 429) {
    console.warn("[fetchTokenDetailsWithCache] => got 429 => waiting 60s...");
    await new Promise((r) => setTimeout(r, 62000));
    console.warn("[fetchTokenDetailsWithCache] => continuing fallback after 429 wait");
    // it needs to refetch til it's not.
    res = await fetch(url);
  }
  if (!res.ok) {
    // handle other errors here
    console.warn(`[fetchTokenDetailsWithCache] GET => not 200, status= ${res.status} on url ${url}`);
    console.log("[fetchTokenDetailsWithCache] Attempting fallback due to non-200 response...");
    return await tryFallback(asset, tokens, assetIdentifier, now);
  }

  // Successful GET: parse external data.
  const externalData = (await res.json()) as AssetDetails;
  console.log(
    `[fetchTokenDetailsWithCache] External data fetched for ${assetIdentifier}:`,
    externalData,
  );
  const newData = await mergeTokenDetails(localToken, externalData);

  tokenInfoCache[assetIdentifier] = { data: newData, fetchedAt: now };
  // this should actually like upsert the existing cache but whatever for now it's fine.
  await saveTokenInfoCache();
  console.log(`[fetchTokenDetailsWithCache] Cached external data for ${assetIdentifier}`);
  return newData;
}

/**
 * tryFallback: if the external GET fails, try using the local token info to generate basic details.
 */
async function tryFallback(
  asset: string,
  tokens: Token[],
  assetIdentifier: string,
  now: number,
): Promise<AssetDetails> {
  console.error(
    "[fetchTokenDetailsWithCache] Fallback: External fetch failed, trying local token info.",
    asset,
    assetIdentifier,
  );
  const contractPattern = /^C[A-Z0-9]{55}$/;
  const parts = assetIdentifier.split(/[:\-]/); // splits on both ":" and "-"
  if (parts.length > 1 && contractPattern.test(parts[-1])) {
    asset = parts[-1];
  }
  const localToken = tokens.find(
    (token) =>
      token.id === asset ||
      token.id === assetIdentifier ||
      token.name === asset ||
      normalizeToken(token.name) === assetIdentifier,
  );
  if (!localToken) {
    console.warn("[fetchTokenDetailsWithCache] Fallback: No matching local token found.");
    throw new Error(`No matching local token found. for ${assetIdentifier} (${asset})`);
  }
  console.log(
    `[fetchTokenDetailsWithCache] Fallback: Generating basic details for ${localToken.name} (${localToken.id}).`,
  );
  const basicDetails: AssetDetails = {
    asset: assetIdentifier,
    contract: localToken.id,
    toml_info: {
      code: localToken.symbol,
      issuer: localToken.id,
      name: localToken.name,
      image: localToken.logoUrl ?? "",
      anchorAssetType: "",
      anchorAsset: "",
      orgName: "",
      orgLogo: "",
    },
  };
  if (tokenInfoCache) {
    tokenInfoCache[assetIdentifier] = { data: basicDetails, fetchedAt: now };
    await saveTokenInfoCache();
  }
  return basicDetails;
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
 * sleep => basic delay
 */
async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * fetchCandles => local route for candle data (unchanged)
 * (You can still use /api/candles internally if desired)
 */
/*
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
  */
