import type { MetadataRoute } from "next";
import { getCachedRoutes } from "@/lib/routeCache";
import { generateTokenRoutes } from "@/app/tokens/[tokenid]/page";
import { generatePairRoutes } from "@/app/pools/[protocol]/[pair]/page";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://app.hoops.finance";
  const now = new Date();
  const staticRoutes = [
    "/",
    "/_not-found",
    "/account/login",
    "/account/signup",
    "/ai-chat",
    "/ai-home",
    "/api/data",
    "/Auth",
    "/developer",
    "/governance",
    "/pools",
    "/portfolio",
    "/privacy",
    "/pro-dashboard",
    "/profile",
    "/robots.txt",
    "/signup",
    "/strategies",
    "/strategies/create",
    "/swap",
    "/tokens",
    "/tos",
  ];
  const protocolRoutes = ["soroswap", "aquarius", "blend", "phoenix", "aqua"].map((p) => `/pools/${p}`);
  const { tokenRoutes, pairRoutes } = await getCachedRoutes(generateTokenRoutes, generatePairRoutes);
  const tokenPaths = tokenRoutes.map((t) => `/tokens/${t.tokenid}`);
  const pairPaths = pairRoutes.map((p) => `/pools/${p.protocol}/${p.pair}`);
  const allPaths = [...staticRoutes, ...protocolRoutes, ...tokenPaths, ...pairPaths];

  return allPaths.map<MetadataRoute.Sitemap[number]>((path) => {
    const url = baseUrl + path;
    const entry: MetadataRoute.Sitemap[number] = {
      url,
      lastModified: now,
      changeFrequency: "daily",
      priority: path === "/" ? 1.0 : 0.7,
    };
    if (path.startsWith("/tokens/")) {
      entry.images = [`${url}/opengraph-image`];
    } else if (path.startsWith("/pools/")) {
      const segments = path.split("/").filter(Boolean);
      if (segments.length === 3) {
        entry.images = [`${url}/opengraph-image`];
      }
    }
    return entry;
  });
}
