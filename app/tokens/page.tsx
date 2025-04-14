// app/tokens/page.tsx
import { Metadata } from "next";
import { fetchCoreData, fetchPeriodDataFromServer } from "@/services/serverData.service";
import type { Market, Pair, PoolRiskApiResponseObject, Token } from "@/utils/types";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/components/ui/button";
import { STABLECOIN_IDS } from "@/utils/utilities";

import { Suspense } from "react";
import { DollarIcon, LightningIcon, WaterIcon } from "@/components/ui/icons";
import { TopTokens } from "@/components/TopTokens";
import { TokenTable } from "@/components/TokenTable";
import { TokenCard } from "@/components/TopTokenCard";
import { TableColumn, TokenTableBody, TokenTableHeader } from "@/components/Tokens/TokenTableParts";

// Revalidate every hour
export const revalidate = 86400;

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
      url: "https://app.hoops.finance/tokens",
      siteName: "Hoops Finance",
    },
    alternates: {
      canonical: "https://app.hoops.finance/tokens",
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

      <div className="tokensHomePage">
        <div className="tokensHomeTitleBar">
          <h1>Tokens</h1>
          <p>Track and analyze token performance</p>
        </div>

        {/* Wrap TopTokens in a Suspense boundary: */}
        {/* The fallback is our existing ServerSideTopTokens */}
        {/* We use a server render compatible component for the fallback */}
        {/*so that the page is prestuctured/prebuilt for SEO and accessibility */}
        {/*purposes and to make the site more scalable. */}
        <Suspense
          fallback={
            <ServerSideTopTokens
              tokens={tokens}
              pairs={pairs}
              poolRiskData={poolRiskData}
              volumeMap={volumeMap}
              tvlMap={tvlMap}
            />
          }
        >
          {/*
            Once the client JS loads, 
            <TopTokens> (the clientside component) replaces the fallback, it has animations or other client only functionality. we want the server one first for SEO.
            */}
          <TopTokens tokens={tokens} pairs={pairs} poolRiskData={poolRiskData} />
        </Suspense>

        {/* A "Read the docs" button (accessible and responsive) */}
        <div className="apiDocsButton">
          <Button
            variant="outline"
            aria-label="Read the documentation about token analytics on Hoops Finance"
          >
            Read the docs
          </Button>
        </div>

        {/* 
          Wrap TokenTable in a Suspense boundary: 
          The fallback is your existing ServerSideTokenTable 
        */}
        <Suspense
          fallback={
            <ServerSideTokenTable tokens={tokens} pairs={pairs} volumeMap={volumeMap} tvlMap={tvlMap} />
          }
        >
          {/* 
            Once client JS loads, 
            <TokenTable> (your "use client" component) replaces the fallback 
          */}
          <TokenTable tokens={tokens} pairs={pairs} poolRiskData={poolRiskData} />
        </Suspense>
      </div>
    </PageLayout>
  );
}

/* ------------------------------------------------------------------ */
/* Helper to build JSON-LD for tokens */
/* ------------------------------------------------------------------ */

function createTokensJSONLD(tokens: Token[]) {
  const nowIso = new Date().toISOString();
  const distributionUrl = "https://api.hoops.finance/api/tokens";

  // We build an array of "FinancialProduct" items, one per token
  const tokenItems = tokens.map((token) => {
    // For display name (symbolName)
    const [symbolName] = token.name.split(":");
    // Construct the detail URL for the token
    const detailUrl =
      token.symbol.toUpperCase() === "XLM"
        ? "https://app.hoops.finance/tokens/native"
        : `https://app.hoops.finance/tokens/${token.name.replace(/:/g, "-")}`;

    // Basic "Offer" object for the token's current price
    // This is optional but often used for financial products in schema.org
    const offers = {
      "@type": "Offer",
      price: token.price || 0,
      priceCurrency: "USD",
      // or use the appropriate currency
      url: detailUrl,
      availability: "https://schema.org/InStock",
    };

    // Additional properties that schema.org doesn’t have official fields for
    // We can store them in "additionalProperty" or "additionalType"
    const additionalProps = [
      {
        "@type": "PropertyValue",
        name: "symbol",
        value: token.symbol,
      },
      {
        "@type": "PropertyValue",
        name: "id",
        value: token.id,
      },
      // You could also store lastUpdated, TVL, or other fields similarly
    ];

    // Return a single "FinancialProduct" describing the token
    return {
      "@type": "FinancialProduct",
      // Core fields
      name: symbolName,
      description: `Token symbol: ${token.symbol}`,
      identifier: token.id,
      url: detailUrl,

      // The "offers" property is a recommended approach for price
      offers,

      // If you want to incorporate lastUpdated as "dateModified":
      dateModified: token.lastUpdated,

      // Extra fields
      additionalProperty: additionalProps,
    };
  });

  // Now wrap everything in a Dataset
  // that references your tokens array via "hasPart" or "about"
  const datasetSchema = {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: "Tokens on Hoops Finance",
    description: "List of Stellar assets on soroban, with their price and metadata.",
    dateModified: new Date(Date.now() - Math.random() * (3 * 24 * 60 * 60 * 1000)),
    // Keywords can help AI/crawlers contextually
    keywords:
      "crypto, tokens, DeFi, finance, stellar, soroban, amm, exchange, yield generation, savings accounts, stablecoins, usdc, usdy, xlm, aqua, btc, eth, usd",
    // This references API as a direct data download
    distribution: {
      "@type": "DataDownload",
      contentUrl: distributionUrl,
      encodingFormat: "application/json",
    },
    // "hasPart" is one way to include multiple items in a Dataset
    hasPart: tokenItems,
  };

  return datasetSchema;
}
/* ------------------------------------------------------------------ */
/* Server-Side Replacement for TopTokens component                    */
/* ------------------------------------------------------------------ */
export interface ServerSideTopTokensProps {
  tokens: Token[];
  pairs: Pair[];
  poolRiskData: PoolRiskApiResponseObject[];
  volumeMap: Map<string, number>;
  tvlMap: Map<string, number>;
}
export function ServerSideTopTokens({
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
    .map((t) => ({ token: t, volume: volumeMap.get(t.id) ?? 0 }))
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  // top by liquidity
  const topByLiquidity = tokens
    .filter((t) => tvlMap.has(t.id))
    .map((t) => ({ token: t, tvl: tvlMap.get(t.id) ?? 0 }))
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 5);

  // top stable
  const topStables = stablecoins
    .map((s) => ({ token: s, tvl: tvlMap.get(s.id) ?? 0 }))
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, 5);

  return (
    <div className="topTokensOverview" role="region" aria-label="Top Tokens Overview">
      <TokenCard
        icon={<LightningIcon />}
        title="Top Volume"
        delay={0.1}
        data={topByVolume.map((item) => ({
          token: item.token,
          value: item.volume,
        }))}
        isServer={true}
      />

      <TokenCard
        icon={<WaterIcon />}
        title="Top Liquidity"
        delay={0.2}
        data={topByLiquidity.map((item) => ({
          token: item.token,
          value: item.tvl,
        }))}
        isServer={true}
      />

      <TokenCard
        icon={<DollarIcon />}
        title="Top Stablecoins"
        delay={0.3}
        data={topStables.map((item) => ({
          token: item.token,
          value: item.tvl,
        }))}
        isServer={true}
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Server-Side Replacement for the TokenTable                         */
/* ------------------------------------------------------------------ */
interface ServerSideTokenTableProps {
  tokens: Token[];
  pairs: Pair[];
  volumeMap: Map<string, number>;
  tvlMap: Map<string, number>;
}

const HEADERS: TableColumn[] = [
  { label: "Token", align: "left" },
  { label: "Price", align: "right" },
  { label: "TVL", align: "right" },
  { label: "Volume", align: "right" },
  { label: "Counter Assets", align: "right" },
  { label: "Last Updated", align: "right" },
  { label: "Actions", align: "right" },
];

function ServerSideTokenTable({ tokens, pairs, volumeMap, tvlMap }: ServerSideTokenTableProps) {
  const realTokenRegex = /^[^:]+:G[A-Z0-9]{55}$/;
  const filteredTokens = tokens.filter(
    (t) => realTokenRegex.test(t.name) || t.symbol.toUpperCase() === "XLM",
  );

  const pairMap = new Map<string, Pair>(pairs.map((p) => [p.id, p]));

  return (
    <div className="serverTokenTableDiv" role="region" aria-label="All Tokens Table">
      <div className="serverTokenHeader">
        <h2 role="heading">All Tokens</h2>
      </div>
      <table className="serverSideTokenTable" role="table">
        <caption className="hidden">
          A table of all the tokens tracked by Hoops Finance available in Stellars Soroban Smart Contract
          system.
        </caption>
        <TokenTableHeader ColLabels={HEADERS} />

        <TokenTableBody
          tokens={filteredTokens}
          pairMap={pairMap}
          tvlMap={tvlMap}
          volumeMap={volumeMap}
          isServer={true}
          noTokensColSpan={HEADERS.length}
        />
      </table>
    </div>
  );
}
