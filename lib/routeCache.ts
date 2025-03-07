// lib/routeCache.ts
import fs from "fs/promises";
import path from "path";

const CACHE_PATH = path.join(process.cwd(), "routeCache.json");
const ONE_DAY = 24 * 60 * 60 * 1000;

interface RouteCacheData {
  lastUpdated: number;
  tokenRoutes: { tokenid: string }[];
  pairRoutes: { protocol: string; pair: string }[];
}

export async function loadRouteCache(): Promise<RouteCacheData | null> {
  try {
    const data = await fs.readFile(CACHE_PATH, "utf-8");
    return JSON.parse(data) as RouteCacheData;
  } catch {
    return null;
  }
}

export async function saveRouteCache(data: RouteCacheData): Promise<void> {
  await fs.writeFile(CACHE_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export async function getCachedRoutes(
  generateTokenRoutes: () => Promise<{ tokenid: string }[]>,
  generatePairRoutes: () => Promise<{ protocol: string; pair: string }[]>,
): Promise<{ tokenRoutes: { tokenid: string }[]; pairRoutes: { protocol: string; pair: string }[] }> {
  const cached = await loadRouteCache();
  const now = Date.now();

  if (cached && now - cached.lastUpdated < ONE_DAY) {
    return {
      tokenRoutes: cached.tokenRoutes,
      pairRoutes: cached.pairRoutes,
    };
  }

  // If no valid cache, generate fresh:
  const tokenRoutes = await generateTokenRoutes();
  const pairRoutes = await generatePairRoutes();

  const newData: RouteCacheData = {
    lastUpdated: now,
    tokenRoutes,
    pairRoutes,
  };
  await saveRouteCache(newData);

  return { tokenRoutes, pairRoutes };
}
