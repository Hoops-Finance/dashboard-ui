// app/tokens/page.tsx

import { Metadata } from "next";
import { fetchCoreData, fetchPeriodDataFromServer } from "@/services/serverData.service";
import type { Market, Pair, PoolRiskApiResponseObject, Token } from "@/utils/types";
import { PageLayout } from "@/components/ui/PageLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { STABLECOIN_IDS } from "@/utils/utilities";

// Revalidate every hour
export const revalidate = 3600;

/**
 * Dynamic page-level metadata for SEO.
 * Fetch token data server-side to highlight the number of tokens in the description.
 */
export async function generateMetadata(): Promise<Metadata> {
  // Fetch just what we need for the metadata (tokens)
  const [{ tokens }] = await Promise.all([
    fetchCoreData(), // returns { markets, pairs, tokens }
  ]);

  const tokenCount = tokens.length;
  const title = "Tokens | Hoops Finance";
  const description = `Track and analyze ${tokenCount} tokens on Hoops Finance.`;

  // Return dynamic metadata, including canonical and Open Graph
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: "https://hoops.finance/tokens", // Adjust if your domain differs
      siteName: "Hoops Finance",
    },
    alternates: {
      canonical: "https://hoops.finance/tokens", // Adjust if your domain differs
    },
  };
}

export default async function TokensPage() {
  // 1) Fetch data from your remote endpoints
  const [{ tokens, pairs }, { poolRiskData }] = await Promise.all([
    fetchCoreData(),
    fetchPeriodDataFromServer("14d"),
  ]);

  // 2) Aggregate volumes & TVLs
  const pairMap = new Map<string, Pair>(pairs.map((p) => [p.id, p]));
  const volumeMap = new Map<string, number>();
  for (const pd of poolRiskData) {
    const vol = parseFloat(pd.volume);
    const p = pairMap.get(pd.pairId);
    if (!p) continue;
    volumeMap.set(p.token0, (volumeMap.get(p.token0) ?? 0) + vol);
    volumeMap.set(p.token1, (volumeMap.get(p.token1) ?? 0) + vol);
  }

  const tvlMap = new Map<string, number>();
  for (const p of pairs) {
    if (!p.tvl) continue;
    tvlMap.set(p.token0, (tvlMap.get(p.token0) ?? 0) + p.tvl);
    tvlMap.set(p.token1, (tvlMap.get(p.token1) ?? 0) + p.tvl);
  }

  // 3) Generate JSON-LD Structured Data
  const structuredData = createTokensJSONLD(tokens);

  // 4) Render the page layout
  return (
    <PageLayout>
      {/* JSON-LD script: Helps search engines index this tokens list */}
      <script
        type="application/ld+json"
        // We use dangerouslySetInnerHTML to embed our JSON-LD
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Tokens</h1>
          <p className="text-muted-foreground">
            Track and analyze token performance
          </p>
        </div>

        {/* Top Tokens Metrics (server-side) */}
        <ServerSideTopTokens
          tokens={tokens}
          pairs={pairs}
          poolRiskData={poolRiskData}
          volumeMap={volumeMap}
          tvlMap={tvlMap}
        />

        {/* A "Read the docs" button (accessible and responsive) */}
        <div className="flex items-center justify-end">
          <Button
            variant="outline"
            className="h-9 gap-2"
            aria-label="Read the documentation about token analytics on Hoops Finance"
          >
            Read the docs
          </Button>
        </div>

        {/* Tokens Table */}
        <ServerSideTokenTable
          tokens={tokens}
          pairs={pairs}
          poolRiskData={poolRiskData}
          volumeMap={volumeMap}
          tvlMap={tvlMap}
        />
      </div>
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Helper to build JSON-LD for tokens */
/* ------------------------------------------------------------------ */
function createTokensJSONLD(tokens: Token[]) {
  // We’ll create an ItemList schema containing basic info about each token.
  // Adjust fields as necessary for your use case.
  const retval = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Tokens on Hoops Finance",
    description: "A list of tradeable tokens available on Hoops Finance.",
    itemListElement: tokens.map((token, index) => {
      const symbolName = token.name.split(":")[0];
      // A rudimentary way to build the detail URL
      const detailUrl =
        token.symbol.toUpperCase() === "XLM"
          ? "https://hoops.finance/tokens/native"
          : `https://hoops.finance/tokens/${token.name.replace(/:/g, "-")}`;

      return {
        "@type": "ListItem",
        position: index + 1,
        name: symbolName,
        url: detailUrl,
      };
    }),
  }
  //console.log(retval);
  return retval;
}

/* ------------------------------------------------------------------ */
/* Server-Side Replacement for TopTokens component                    */
/* ------------------------------------------------------------------ */
interface ServerSideTopTokensProps {
  tokens: Token[];
  pairs: Pair[];
  poolRiskData: PoolRiskApiResponseObject[];
  volumeMap: Map<string, number>;
  tvlMap: Map<string, number>;
}
function ServerSideTopTokens({
  tokens,
  pairs,
  poolRiskData,
  volumeMap,
  tvlMap,
}: ServerSideTopTokensProps) {
  // stablecoins
  const stablecoins = tokens.filter((t) => STABLECOIN_IDS.has(t.id));

  // top by volume
  const topByVolume = tokens
    .filter((t) => volumeMap.has(t.id))
    .map((t) => ({ token: t, volume: volumeMap.get(t.id)! }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  // top by liquidity
  const topByLiquidity = tokens
    .filter((t) => tvlMap.has(t.id))
    .map((t) => ({ token: t, tvl: tvlMap.get(t.id)! }))
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 5);

  // top stable
  const topStables = stablecoins
    .map((s) => ({ token: s, tvl: tvlMap.get(s.id) ?? 0 }))
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 5);

  return (
    <div className="grid gap-6 md:grid-cols-3" role="region" aria-label="Top Tokens Overview">
      {/* By Volume */}
      <Card>
        <CardHeader>
          <CardTitle>Top Tokens by Volume</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topByVolume.map((item, i) => {
            const rank = i + 1;
            const symbolName = item.token.name.split(":")[0];
            return (
              <div
                key={item.token.id}
                className="flex items-center justify-between"
                aria-label={`Token ranked ${rank} by volume`}
              >
                <div className="flex gap-2">
                  <span className="text-muted-foreground">#{rank}</span>
                  <span className="text-foreground font-medium">
                    {symbolName} ({item.token.symbol})
                  </span>
                </div>
                <span className="text-foreground">
                  ${item.volume.toLocaleString()}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* By Liquidity */}
      <Card>
        <CardHeader>
          <CardTitle>Top Tokens by Liquidity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topByLiquidity.map((item, i) => {
            const rank = i + 1;
            const symbolName = item.token.name.split(":")[0];
            return (
              <div
                key={item.token.id}
                className="flex items-center justify-between"
                aria-label={`Token ranked ${rank} by liquidity`}
              >
                <div className="flex gap-2">
                  <span className="text-muted-foreground">#{rank}</span>
                  <span className="text-foreground font-medium">
                    {symbolName} ({item.token.symbol})
                  </span>
                </div>
                <span className="text-foreground">
                  ${item.tvl.toLocaleString()}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Stablecoins */}
      <Card>
        <CardHeader>
          <CardTitle>Top Stablecoins</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {topStables.map((item, i) => {
            const rank = i + 1;
            const symbolName = item.token.name.split(":")[0];
            return (
              <div
                key={item.token.id}
                className="flex items-center justify-between"
                aria-label={`Stablecoin ranked ${rank}`}
              >
                <div className="flex gap-2">
                  <span className="text-muted-foreground">#{rank}</span>
                  <span className="text-foreground font-medium">
                    {symbolName} ({item.token.symbol})
                  </span>
                </div>
                <span className="text-foreground">
                  ${item.tvl.toLocaleString()}
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Server-Side Replacement for the TokenTable                         */
/* ------------------------------------------------------------------ */
interface ServerSideTokenTableProps {
  tokens: Token[];
  pairs: Pair[];
  poolRiskData: PoolRiskApiResponseObject[];
  volumeMap: Map<string, number>;
  tvlMap: Map<string, number>;
}

function ServerSideTokenTable({
  tokens,
  pairs,
  poolRiskData,
  volumeMap,
  tvlMap,
}: ServerSideTokenTableProps) {
  // Filter to “real” tokens as in your original approach
  const realTokenRegex = /^[^:]+:G[A-Z0-9]{55}$/;
  const filteredTokens = tokens.filter(
    (t) => realTokenRegex.test(t.name) || t.symbol.toUpperCase() === "XLM"
  );

  const pairMap = new Map<string, Pair>(pairs.map((p) => [p.id, p]));

  // Example function to compute how many unique counter assets for each token
  function getCounterAssetsCount(token: Token): number {
    let count = 0;
    for (const tokenPair of token.pairs) {
      const p = pairMap.get(tokenPair.pairId);
      if (p) {
        // If token is token0, the other side is token1, etc.
        count++;
      }
    }
    return count;
  }

  return (
    <div className="mt-4 w-full overflow-auto" role="region" aria-label="All Tokens Table">
      <div className="p-4">
        <h2 className="text-xl font-bold">All Tokens</h2>
      </div>
      <table className="w-full border-collapse" role="table">
        <thead>
          <tr className="border-b" role="row">
            <th className="px-4 py-2 text-left" role="columnheader">
              Token
            </th>
            <th className="px-4 py-2 text-right" role="columnheader">
              Price
            </th>
            <th className="px-4 py-2 text-right" role="columnheader">
              TVL
            </th>
            <th className="px-4 py-2 text-right" role="columnheader">
              Counter Assets
            </th>
            <th className="px-4 py-2 text-right" role="columnheader">
              Last Updated
            </th>
            <th className="px-4 py-2 text-right" role="columnheader">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filteredTokens.length === 0 ? (
            <tr role="row">
              <td
                colSpan={6}
                className="h-10 px-4 text-center text-sm text-muted-foreground"
                role="cell"
              >
                No tokens found
              </td>
            </tr>
          ) : (
            filteredTokens.map((token) => {
              const [symbolName] = token.name.split(":");
              const price =
                token.price > 0
                  ? token.price.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 6,
                    })
                  : "0.00";
              const tvl = tvlMap.get(token.id) ?? 0;
              const counterCount = getCounterAssetsCount(token);

              // Basic route logic
              let detailsUrl: string;
              if (token.symbol.toUpperCase() === "XLM") {
                detailsUrl = "/tokens/native";
              } else {
                detailsUrl = `/tokens/${token.name.replace(/:/g, "-")}`;
              }

              return (
                <tr
                  key={token.id}
                  aria-label={`Token ${symbolName}`}
                >
                  <td className="px-4 py-2" role="cell">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary/10 flex items-center justify-center">
                        {token.symbol.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-medium">{symbolName}</div>
                        <div className="text-sm text-muted-foreground">
                          {token.symbol}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-2 text-right" role="cell">
                    ${price}
                  </td>
                  <td className="px-4 py-2 text-right" role="cell">
                    ${tvl.toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right" role="cell">
                    {counterCount}
                  </td>
                  <td
                    className="px-4 py-2 text-right text-sm text-muted-foreground"
                    role="cell"
                  >
                    {new Date(token.lastUpdated).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right" role="cell">
                    <a
                      href={`https://stellar.expert/explorer/public/asset/${symbolName}-???`}
                      target="_blank"
                      rel="noreferrer"
                      className="underline text-primary hover:text-primary/80"
                    >
                      Explorer
                    </a>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
