"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { AlertCircle, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";
import type { AssetDetails, Pair, Token, PoolRiskApiResponseObject } from "@/utils/types";
import { useDataContext } from "@/contexts/DataContext";
import ChartComponent from "@/components/ChartComponent";
import { PoolsTable } from "@/components/PoolsTable";
import { TopPools } from "@/components/TopPools";
import { CandleDataPoint, VolumeDataPoint, PERIOD_OPTIONS, AllowedPeriods, STABLECOIN_IDS } from "@/utils/utilities";
import { UTCTimestamp } from "lightweight-charts";

export default function TokenDetailsPage() {
  const { tokens, pairs, poolRiskData, loading, fetchTokenDetails, fetchCandles, period, setPeriod, getPairsForToken } = useDataContext();
  const router = useRouter();
  const params = useParams();
  const tokenIdParam = params.tokenid as string;

  let tokenAssetId: string;
  if (tokenIdParam === "native") {
    tokenAssetId = "native";
  } else {
    tokenAssetId = tokenIdParam.replace(/-/g, ":");
  }

  const token: Token | undefined = useMemo(() => {
    if (tokenAssetId === "native") {
      return tokens.find((t) => t.symbol.toUpperCase() === "XLM");
    } else {
      return tokens.find((t) => t.name === tokenAssetId);
    }
  }, [tokens, tokenAssetId]);

  const tokenPairs: Pair[] = useMemo(() => {
    if (!token) return [];
    return getPairsForToken(token);
  }, [token, getPairsForToken]);

  const tokenPools: PoolRiskApiResponseObject[] = useMemo(() => {
    if (tokenPairs.length === 0) return [];
    const pairIds = new Set(tokenPairs.map((p) => p.id));
    return poolRiskData.filter((pool) => pairIds.has(pool.pairId));
  }, [tokenPairs, poolRiskData]);

  const [candleData, setCandleData] = useState<CandleDataPoint[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([]);
  const [chartError, setChartError] = useState<string | null>(null);
  const [tokenDetails, setTokenDetails] = useState<AssetDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      return;
    }
    setDetailsLoading(true);
    fetchTokenDetails(tokenAssetId)
      .then((details) => {
        setTokenDetails(details);
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          console.error("Error fetching token details:", error.message);
        } else {
          console.error("Error fetching token details: unknown error");
        }
      })
      .finally(() => {
        setDetailsLoading(false);
      });
  }, [token, tokenAssetId, fetchTokenDetails]);

  useEffect(() => {
    if (!token) return;
    const loadCandles = async () => {
      try {
        setChartError(null);
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
        const rawData = await fetchCandles(tokenAssetId, null, from, to);
        const arr = rawData as { time: number; open: number; high: number; low: number; close: number; baseVolume: number }[];
        if (arr.length === 0) {
          setCandleData([]);
          setVolumeData([]);
          return;
        }

        const cData: CandleDataPoint[] = arr.map((c) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close
        }));

        const vData: VolumeDataPoint[] = arr.map((c) => ({
          time: c.time as UTCTimestamp,
          value: c.baseVolume,
          color: c.close >= c.open ? "#26a69a" : "#ef5350"
        }));

        setCandleData(cData);
        setVolumeData(vData);
      } catch (error: unknown) {
        let message = "Unknown error";
        if (error instanceof Error) {
          message = error.message;
        }
        console.error("Error loading chart data:", message);
        setChartError("Unable to load chart data: " + message);
        setCandleData([]);
        setVolumeData([]);
      }
    };
    void loadCandles();
  }, [token, tokenAssetId, period, fetchCandles]);

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading token data...</p>
      </div>
    );
  }

  const displaySymbol = token.symbol;
  const displayName = token.name.split(":")[0];
  const imageUrl = tokenDetails?.toml_info.image ?? "";

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background flex flex-col">
      <div className="container max-w-7xl mx-auto px-4 flex-1 flex flex-col py-6 gap-6">
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
            <div className="w-10 h-10 rounded-full overflow-hidden relative" title={`${displaySymbol} logo`}>
              <Image src={imageUrl} alt={`${displaySymbol} logo`} fill style={{ objectFit: "cover" }} unoptimized />
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight" title={`${displayName} token details`}>
            {displayName} ({displaySymbol})
          </h1>
        </header>

        <div className="flex justify-end">
          <Select
            value={period}
            onValueChange={(v) => {
              setPeriod(v as AllowedPeriods);
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

        <section className="h-[400px] lg:h-[500px] rounded-lg border bg-card overflow-hidden" aria-label="Price & Volume Chart">
          <ChartComponent candleData={candleData} volumeData={volumeData} />
          {chartError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-4">
                <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">{chartError}</p>
              </div>
            </div>
          )}
        </section>

        {detailsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            <p className="text-sm text-muted-foreground ml-2">Loading token details...</p>
          </div>
        ) : tokenDetails ? (
          <div className="space-y-6" aria-label="Token details and pools">
            <div className="stat-card">
              <Card className="token-card">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">${tokenDetails.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
                </CardContent>
              </Card>
              <Card className="token-card">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Supply</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">{tokenDetails.supply.toLocaleString()}</h3>
                </CardContent>
              </Card>
              <Card className="token-card">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Volume (7d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">${tokenDetails.volume7d.toLocaleString()}</h3>
                </CardContent>
              </Card>
              <Card className="token-card">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">{tokenDetails.trades.toLocaleString()}</h3>
                </CardContent>
              </Card>
            </div>

            {tokenDetails.home_domain && (
              <Card className="token-card">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Home Domain</CardTitle>
                </CardHeader>
                <CardContent>
                  <a href={`https://${tokenDetails.home_domain}`} target="_blank" rel="noreferrer" className="text-primary hover:underline" title="Token home domain">
                    {tokenDetails.home_domain}
                  </a>
                </CardContent>
              </Card>
            )}

            <TopPools data={tokenPools} pairs={pairs} tokens={tokens} stablecoinIds={STABLECOIN_IDS} period={period} />

            <div className="space-y-4">
              <h2 className="text-xl font-bold" title={`Pools that ${displayName} participates in`}>
                Pools for {displayName}
              </h2>
              <div className="pools-motion">
                <PoolsTable data={tokenPools} pairs={pairs} tokens={tokens} />
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
            <p className="text-sm text-muted-foreground">No details available</p>
          </div>
        )}
      </div>
    </div>
  );
}
