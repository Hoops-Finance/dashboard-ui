// app/tokens/[tokenid]/Page.client.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import Image from "next/image";
import type {
  PoolRiskApiResponseObject,
  Pair,
  Token,
  Market,
} from "@/utils/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TopPools } from "@/components/TopPools";
import { PoolsTable } from "@/components/PoolsTable";
import {
  PERIOD_OPTIONS,
  AllowedPeriods,
  STABLECOIN_IDS,
} from "@/utils/utilities";
import ChartComponent from "@/components/ChartComponent";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";

/**
 * Props from the server component:
 */
interface TokenPageProps {
  token: Token;
  pairs: Pair[];
  tokenPairs: Pair[];
  tokenPools: PoolRiskApiResponseObject[];
  allMarkets: Market[];
  allTokens: Token[];
  allPoolRiskData: PoolRiskApiResponseObject[];
}

export default function PageClient(props: TokenPageProps) {
  const { token, tokenPairs, tokenPools } = props;

  const router = useRouter();
  const [period, setPeriod] = useState<AllowedPeriods>("14d");
  const [candleData, setCandleData] = useState<any[]>([]);
  const [volumeData, setVolumeData] = useState<any[]>([]);
  const [chartError, setChartError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // If token is missing or invalid, show 404 style
  if (!token) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <AlertCircle
            className="h-8 w-8 text-muted-foreground mx-auto mb-2"
            aria-hidden="true"
          />
          <p className="text-sm text-muted-foreground">Token not found</p>
          <Button
            variant="ghost"
            className="mt-4"
            onClick={() => {
              router.push("/tokens");
            }}
            title="Go back to tokens list"
          >
            Back to Tokens
          </Button>
        </div>
      </div>
    );
  }

  // Candle fetch logic (if you want it dynamic):
  useEffect(() => {
    async function loadCandles() {
      try {
        setLoading(true);
        setChartError(null);

        // We only need to do an on-demand fetchCandles call:
        // For example, fetch from the data.service if you like:
        // let from = ...
        // let to = ...
        // let candleRes = await fetchCandles(...)
        // setCandleData(...)
        // setVolumeData(...)
      } catch (err) {
        if (err instanceof Error) {
          setChartError(err.message);
        }
      } finally {
        setLoading(false);
      }
    }
    void loadCandles();
  }, [period, token]);

  // Basic info:
  const displaySymbol = token.symbol;
  const displayName = token.name.split(":")[0];
  const imageUrl = ""; // If you have a toml_info or something

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background flex flex-col">
      <div className="container max-w-7xl mx-auto px-4 flex-1 flex flex-col py-6 gap-6">
        {/* Title row */}
        <header className="flex-center-g-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              router.push("/tokens");
            }}
            className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
            title="Go back to tokens list"
          >
            <ChevronRight className="h-4 w-4 rotate-180" aria-hidden="true" />
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

        {/* Period selector */}
        <div className="flex justify-end">
          <Select
            value={period}
            onValueChange={(val) => {
              setPeriod(val as AllowedPeriods);
            }}
          >
            <SelectTrigger className="w-[100px] h-9" title="Select time period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent align="end">
              {PERIOD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Candle chart section */}
        <section
          className="h-[400px] lg:h-[500px] rounded-lg border bg-card overflow-hidden"
          aria-label="Price & Volume Chart"
        >
          <ChartComponent candleData={candleData} volumeData={volumeData} />
          {chartError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <AlertCircle
                  className="h-8 w-8 text-muted-foreground mx-auto mb-2"
                  aria-hidden="true"
                />
                <p className="text-sm text-muted-foreground">{chartError}</p>
              </div>
            </div>
          )}
        </section>

        {/* Example stats - the server data is in props */}
        <div className="stat-card">
          <Card className="token-card">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-muted-foreground">Symbol</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="token-card-title">{token.symbol}</h3>
            </CardContent>
          </Card>

          <Card className="token-card">
            <CardHeader className="pb-1">
              <CardTitle className="text-sm text-muted-foreground">Price</CardTitle>
            </CardHeader>
            <CardContent>
              <h3 className="token-card-title">${token.price.toLocaleString()}</h3>
            </CardContent>
          </Card>
        </div>

        {/* Top Pools for this token */}
        <TopPools
          data={tokenPools}
          pairs={props.pairs}          // all pairs or just subset is up to you
          tokens={props.allTokens}    // pass all tokens if needed
          stablecoinIds={STABLECOIN_IDS}
          period={period}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-bold" title={`Pools for ${displayName}`}>
            Pools for {displayName}
          </h2>
          <div className="pools-motion">
            <PoolsTable
              data={tokenPools}
              pairs={props.pairs}
              tokens={props.allTokens}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
