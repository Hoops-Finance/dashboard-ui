"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDataContext } from "@/contexts/DataContext";
import { UTCTimestamp } from "lightweight-charts";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertCircle, ChevronRight, LineChart, Loader2 } from "lucide-react";
import Image from "next/image";
import type { AssetDetails, Pair, Token } from "@/utils/newTypes";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import ChartComponent from "@/components/ChartComponent";

interface CandleDataPoint {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}
interface VolumeDataPoint {
  time: UTCTimestamp;
  value: number;
  color: string;
}

const PERIOD_OPTIONS = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
] as const;

function convertNameForRoute(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName === 'xlm' || lowerName === 'native') {
    return 'native';
  }
  return name.replace(/:/g, '-');
}

export default function TokenDetailsPage() {
  const { tokens, pairs, poolRiskData, loading, fetchTokenDetails, fetchCandles, period, setPeriod } = useDataContext();
  const router = useRouter();
  const params = useParams();
  const tokenIdParam = params.tokenid as string;

  let tokenAssetId: string;
  if (tokenIdParam === 'native') {
    tokenAssetId = 'native';
  } else {
    tokenAssetId = tokenIdParam.replace(/-/g, ':');
  }

  const [chartStyle, setChartStyle] = useState<'candlestick'|'line'|'area'>('candlestick');
  const [showMACD, setShowMACD] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [inverted, setInverted] = useState(false);

  const [candleData, setCandleData] = useState<CandleDataPoint[]>([]);
  const [volumeData, setVolumeData] = useState<VolumeDataPoint[]>([]);
  const [chartError, setChartError] = useState<string|null>(null);

  const [tokenDetails, setTokenDetails] = useState<AssetDetails|null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);

  // Find the token object from tokens array
  const token: Token | undefined = useMemo(() => {
    if (tokenAssetId === 'native') {
      // Find XLM token
      return tokens.find((t) => t.symbol.toUpperCase() === 'XLM');
    } else {
      return tokens.find((t) => t.name === tokenAssetId);
    }
  }, [tokens, tokenAssetId]);

  useEffect(() => {
    console.log("Token ID Param:", tokenIdParam);
    console.log("tokenAssetId:", tokenAssetId);
    console.log("Found token:", token);
  }, [token, tokenAssetId, tokenIdParam]);

  useEffect(() => {
    if (!token) {
      console.log("No token found for tokenAssetId:", tokenAssetId);
      return;
    }
    setDetailsLoading(true);
    fetchTokenDetails(tokenAssetId)
      .then((details) => {
        console.log("Fetched token details:", details);
        setTokenDetails(details);
      })
      .catch((error) => {
        console.error("Error fetching token details:", error);
      })
      .finally(() => setDetailsLoading(false));
  }, [token, tokenAssetId, fetchTokenDetails]);

  useEffect(() => {
    if (!token) return;
    const loadCandles = async () => {
      try {
        setChartError(null);
        const to = Math.floor(Date.now()/1000);
        let from:number;
        switch(period) {
          case '24h': from=to-24*3600;break;
          case '7d': from=to-7*24*3600;break;
          case '30d': from=to-30*24*3600;break;
          default: from=to-7*24*3600;
        }
        const rawData = await fetchCandles(tokenAssetId, null, from, to);
        console.log("Fetched candle data:", rawData);
        if(!rawData||rawData.length===0){
          setCandleData([]);
          setVolumeData([]);
          return;
        }

        const cData: CandleDataPoint[] = rawData.map((c: {time:number;open:number;high:number;low:number;close:number;baseVolume:number})=>({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        const vData: VolumeDataPoint[] = rawData.map((c:{time:number;open:number;close:number;baseVolume:number})=>({
          time: c.time as UTCTimestamp,
          value: c.baseVolume,
          color: c.close>=c.open?'#26a69a':'#ef5350',
        }));

        setCandleData(cData);
        setVolumeData(vData);
      } catch (error:unknown) {
        console.error('Error loading chart data:',error);
        const message = error instanceof Error ? error.message:'Unknown error';
        setChartError('Unable to load chart data: '+message);
        setCandleData([]);
        setVolumeData([]);
      }
    };
    loadCandles();
  }, [token, tokenAssetId, period, fetchCandles]);

  const getPairsForToken = useCallback((currentToken: Token): Pair[] => {
    const pairMap = new Map<string, Pair>();
    for(const pairItem of pairs) {
      pairMap.set(pairItem.id, pairItem);
    }
  
    const tokenPairs: Pair[] = [];
    for(const tokenPairPrice of currentToken.pairs) {
      const foundPair = pairMap.get(tokenPairPrice.pairId);
      if(foundPair) tokenPairs.push(foundPair);
    }
    console.log("Pairs for token:", currentToken.name, tokenPairs);
    return tokenPairs;
  }, [pairs]);
  
  const tokenPairs: Pair[] = useMemo(() => token ? getPairsForToken(token) : [], [token, getPairsForToken]);

  useEffect(() => {
    if(tokenPairs.length > 0) {
      console.log("Checking token0Details and token1Details in tokenPairs:");
      for(const pairItem of tokenPairs) {
        console.log("PairItem:", pairItem);
        console.log("token0Details:", pairItem.token0Details);
        console.log("token1Details:", pairItem.token1Details);
      }
    }
  }, [tokenPairs]);

  const displaySymbol = token? token.symbol : "";
  const displayName = token? token.name.split(':')[0] : "";
  const imageUrl = tokenDetails?.toml_info.image || '';

  if(!token){
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true"/>
          <p className="text-sm text-muted-foreground">Token not found</p>
          <Button variant="ghost" className="mt-4" onClick={()=>router.push('/tokens')} title="Go back to tokens list">
            Back to Tokens
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background flex flex-col">
      <div className="container max-w-7xl mx-auto px-4 flex-1 flex flex-col py-6 gap-6">
        <header className="flex-center-g-4">
          <Button variant="ghost" size="sm" onClick={()=>router.push('/tokens')} className="gap-2 -ml-2 text-muted-foreground hover:text-foreground" title="Go back to tokens list">
            <ChevronRight className="h-4 w-4 rotate-180" aria-hidden="true"/>
            Back to Tokens
          </Button>
          {imageUrl && (
            <div className="w-10 h-10 rounded-full overflow-hidden relative" title={`${displaySymbol} logo`}>
              <Image src={imageUrl} alt={`${displaySymbol} logo`} fill style={{objectFit:'cover'}} unoptimized/>
            </div>
          )}
          <h1 className="text-xl font-bold tracking-tight" title={`${displayName} token details`}>
            {displayName} ({displaySymbol})
          </h1>
        </header>

        {/* Toolbar for chart style and indicators */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
          <div className="flex-center-g-2">
            <Button variant={inverted?'default':'secondary'} onClick={()=>setInverted(!inverted)} title="Invert price">
              Switch Base Price
            </Button>
          </div>
          <div className="flex-center-g-2">
            <Button variant={chartStyle === 'candlestick'?'default':'secondary'} onClick={()=>setChartStyle('candlestick')} title="Candlestick chart">
              Candlestick
            </Button>
            <Button variant={chartStyle === 'line'?'default':'secondary'} onClick={()=>setChartStyle('line')} title="Line chart">
              Line
            </Button>
            <Button variant={chartStyle === 'area'?'default':'secondary'} onClick={()=>setChartStyle('area')} title="Area chart">
              Area
            </Button>
          </div>
          <div className="flex-center-g-2">
            <Button variant={showMACD?'default':'secondary'} onClick={()=>setShowMACD(!showMACD)} title="Toggle MACD indicator">
              MACD
            </Button>
            <Button variant={showRSI?'default':'secondary'} onClick={()=>setShowRSI(!showRSI)} title="Toggle RSI indicator">
              RSI
            </Button>
            <Button variant={showSMA?'default':'secondary'} onClick={()=>setShowSMA(!showSMA)} title="Toggle SMA indicator">
              SMA
            </Button>
            <Button variant={showEMA?'default':'secondary'} onClick={()=>setShowEMA(!showEMA)} title="Toggle EMA indicator">
              EMA
            </Button>
            <Button variant={showBollinger?'default':'secondary'} onClick={()=>setShowBollinger(!showBollinger)} title="Toggle Bollinger Bands indicator">
              Bollinger
            </Button>
          </div>
          <div className="flex-center-g-2">
            <Select value={period as "24h"|"7d"|"30d"} onValueChange={(v:"24h"|"7d"|"30d")=>setPeriod(v)}>
              <SelectTrigger className="w-[100px] h-9" title="Select time period">
                <SelectValue placeholder="Select period"/>
              </SelectTrigger>
              <SelectContent align="end">
                {PERIOD_OPTIONS.map((o)=>( 
                  <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Chart Section */}
        <section className="h-[400px] lg:h-[500px] rounded-lg border bg-card overflow-hidden" aria-label="Price & Volume Chart">
          <div className="h-full flex flex-col">
            <div className="flex-1 relative bg-muted/10">
              <ChartComponent
                candleData={candleData}
                volumeData={volumeData}
                chartStyle={chartStyle}
                showMACD={showMACD}
                showRSI={showRSI}
                showSMA={showSMA}
                showEMA={showEMA}
                showBollinger={showBollinger}
                inverted={inverted}
              />
              {chartError && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-4">
                    <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true"/>
                    <p className="text-sm text-muted-foreground">
                      {chartError}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Token Details */}
        {detailsLoading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="spinner" aria-hidden="true"/>
            <p className="text-sm text-muted-foreground ml-2">Loading token details...</p>
          </div>
        ) : tokenDetails ? (
          <div className="space-y-6" aria-label="Token details and pools">
            {/* Details Cards */}
            <div className="stat-card">
              <Card className="token-card">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Price</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">
                    ${tokenDetails.price.toLocaleString(undefined,{minimumFractionDigits:2})}
                  </h3>
                </CardContent>
              </Card>
              <Card className="token-card">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Supply</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">
                    {tokenDetails.supply.toLocaleString()}
                  </h3>
                </CardContent>
              </Card>
              <Card className="token-card">
                <CardHeader className="pb-1">   
                  <CardTitle className="text-sm text-muted-foreground">Volume (7d)</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">
                    ${tokenDetails.volume7d.toLocaleString()}
                  </h3>
                </CardContent>
              </Card>
              <Card className="token-card">
                <CardHeader className="pb-1">
                  <CardTitle className="text-sm text-muted-foreground">Trades</CardTitle>
                </CardHeader>
                <CardContent>
                  <h3 className="token-card-title">
                    {tokenDetails.trades.toLocaleString()}
                  </h3>
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

            <div className="space-y-4">
              <h2 className="text-xl font-bold" title={`Pools that ${displayName} participates in`}>
                Pools for {displayName}
              </h2>
              <div className="token-table-pools">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pool</TableHead>
                      <TableHead className="text-right">Volume</TableHead>
                      <TableHead className="text-right">APR</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tokenPairs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="table-cell-base">
                          No pools found for this token
                        </TableCell>
                      </TableRow>
                    ) : tokenPairs.map((pairItem: Pair) => {
                      console.log("Processing pairItem:", pairItem);
                      const poolData = poolRiskData.find(x=>x.pairId===pairItem.id);
                      const volume = poolData? poolData.volume:"0";
                      const apr = poolData? poolData.apr:"--";

                      if(!pairItem.token0Details || !pairItem.token1Details) {
                        console.warn("Missing token details for pair:", pairItem.id, pairItem);
                        return null; // skip rendering this pair
                      }

                      // Construct the pair route:
                      const t0Name = convertNameForRoute(pairItem.token0Details.name);
                      const t1Name = convertNameForRoute(pairItem.token1Details.name);
                      const protocol = pairItem.protocol.toLowerCase();
                      const pairPath = `/pools/${protocol}/${t0Name}-${t1Name}`;

                      const token0Label = pairItem.token0Details.name.split(':')[0];
                      const token1Label = pairItem.token1Details.name.split(':')[0];
                      const pairLabel = `${token0Label}/${token1Label}`;

                      return (
                        <TableRow
                          key={pairItem.id}
                          className="table-row-hover"
                          title={`View pool for ${pairLabel}`}
                          onClick={()=>router.push(pairPath)}
                        >
                          <TableCell className="h-10 px-4 align-middle">{pairLabel}</TableCell>
                          <TableCell className="table-header-cell">${Number(volume).toLocaleString()}</TableCell>
                          <TableCell className="table-header-cell">{apr}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true"/>
            <p className="text-sm text-muted-foreground">No details available</p>
          </div>
        )}
      </div>
    </div>
  );
}
