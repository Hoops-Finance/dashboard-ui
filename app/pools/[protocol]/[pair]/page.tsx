"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, BarChart3, ChevronRight, Copy, ExternalLink, FileCode, LineChart, Lock, Plus, Settings, Share2, Shield, Tag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useDataContext } from "@/contexts/DataContext";
import ChartComponent from "@/components/ChartComponent";
import { UTCTimestamp } from "lightweight-charts";

interface StatCardProps {
  title: string;
  value: string | number;
  tooltip?: string;
  icon?: React.ReactNode;
}

const StatCard = ({ title, value, tooltip, icon }: StatCardProps) => (
  <div className="flex items-start space-x-4 p-4 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
    {icon && (
      <div className="p-2 bg-background rounded-md">
        {icon}
      </div>
    )}
    <div className="flex-1 space-y-1">
      <div className="flex items-center">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {tooltip && (
          <span
            className="ml-2 text-muted-foreground cursor-help"
            title={tooltip}
          >
            ⓘ
          </span>
        )}
      </div>
      <p className="text-2xl font-bold tracking-tight text-foreground">
        {value}
      </p>
    </div>
  </div>
);

const PERIOD_OPTIONS = [
  { value: "24h", label: "24H" },
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "180d", label: "180D" },
  { value: "360d", label: "360D" },
] as const;

type PeriodOption = typeof PERIOD_OPTIONS[number]["value"];

const getProtocolDisplay = (protocol: string): string => {
  return protocol.toLowerCase() === 'aqua' ? 'Aquarius' :
    protocol.charAt(0).toUpperCase() + protocol.slice(1).toLowerCase();
};

export default function PoolPage({ params }: { params: { protocol: string; pair: string } }) {
  const router = useRouter();
  const { poolRiskData, period, setPeriod, loading, fetchCandles, pairs } = useDataContext();
  const [copyFeedback, setCopyFeedback] = useState<string>('');
  const [chartStyle, setChartStyle] = useState<'candlestick'|'line'|'area'>('candlestick');
  const [showMACD, setShowMACD] = useState(false);
  const [showRSI, setShowRSI] = useState(false);
  const [showSMA, setShowSMA] = useState(false);
  const [showEMA, setShowEMA] = useState(false);
  const [showBollinger, setShowBollinger] = useState(false);
  const [inverted, setInverted] = useState(false);

  const protocolParam = params.protocol.toLowerCase();
  const pairParam = params.pair;

  const [token0Name, token1Name] = useMemo(() => {
    const parts = pairParam.split('-');
    if (parts.length === 4) {
      const t0symbol = parts[0];
      const t0issuer = parts[1];
      const t1symbol = parts[2];
      const t1issuer = parts[3];
      return [`${t0symbol}:${t0issuer}`, `${t1symbol}:${t1issuer}`];
    } else if (parts.length === 3) {
      if (parts[0].toLowerCase() === 'native') {
        const t0Name = 'native';
        const t1symbol = parts[1];
        const t1issuer = parts[2];
        return [t0Name, `${t1symbol}:${t1issuer}`];
      } else {
        return ["native", "XLM"];
      }
    } else {
      return ["native", "native"];
    }
  }, [pairParam]);

  const poolData = useMemo(() => {
    const foundPair = pairs.find(pr => {
      if (!pr.token0Details || !pr.token1Details) return false;
      return (
        (pr.token0Details.name === token0Name && pr.token1Details.name === token1Name) ||
        (pr.token0Details.name === token1Name && pr.token1Details.name === token0Name)
      );
    });

    if (!foundPair) return undefined;

    return poolRiskData.find(pool => pool.pairId === foundPair.id);
  }, [pairs, poolRiskData, token0Name, token1Name]);

  const [candleData, setCandleData] = useState<{time:UTCTimestamp;open:number;high:number;low:number;close:number}[]>([]);
  const [volumeData, setVolumeData] = useState<{time:UTCTimestamp;value:number;color:string}[]>([]);
  const [chartError, setChartError] = useState<string|null>(null);

  useEffect(() => {
    if (!poolData || loading) return;
    const loadData = async () => {
      try {
        setChartError(null);
        const to = Math.floor(Date.now() / 1000);
        let from: number;
        switch (period) {
          case '24h':
            from = to - 24 * 3600;
            break;
          case '7d':
            from = to - 7 * 24 * 3600;
            break;
          case '30d':
            from = to - 30 * 24 * 3600;
            break;
          case '90d':
            from = to - 90 * 24 * 3600;
            break;
          case '180d':
            from = to - 180 * 24 * 3600;
            break;
          case '360d':
            from = to - 360 * 24 * 3600;
            break;
          default:
            from = to - 7 * 24 * 3600;
        }

        const rawData = await fetchCandles(token0Name, token1Name, from, to);
        if (!rawData || rawData.length === 0) {
          setCandleData([]);
          setVolumeData([]);
          return;
        }

        const cData = rawData.map((c: { time: number; open: number; high: number; low: number; close: number; baseVolume: number }) => ({
          time: c.time as UTCTimestamp,
          open: c.open,
          high: c.high,
          low: c.low,
          close: c.close,
        }));

        const vData = rawData.map((c: { time: number; open: number; close: number; baseVolume: number }) => ({
          time: c.time as UTCTimestamp,
          value: c.baseVolume,
          color: c.close >= c.open ? '#26a69a' : '#ef5350',
        }));

        setCandleData(cData);
        setVolumeData(vData);
      } catch (error:unknown) {
        console.error('Error loading chart data:', error);
        const message = error instanceof Error ? error.message : 'Unknown error';
        setChartError('Unable to load chart data: ' + message);
        setCandleData([]);
        setVolumeData([]);
      }
    };
    loadData();
  }, [poolData, period, fetchCandles, loading, token0Name, token1Name]);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback('Copied!');
      setTimeout(() => setCopyFeedback(''), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex flex-col items-center justify-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Loading pool data...</p>
      </div>
    );
  }

  if (!poolData) {
    return (
      <div className="min-h-[calc(100vh-72px)] bg-background flex items-center justify-center">
        <div className="text-center p-4">
          <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Pool not found</p>
          <Button variant="ghost" className="mt-4" onClick={() => router.push('/pools')}>
            Back to Pools
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-background flex flex-col">
      <div className="container max-w-7xl mx-auto px-4 flex-1 flex flex-col">
        {/* Header Section */}
        <header className="py-4 border-b border-border">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2 -ml-2 text-muted-foreground hover:text-foreground w-fit"
                onClick={() => router.push('/pools')}
              >
                <ChevronRight className="h-4 w-4 rotate-180" aria-hidden="true" />
                Back to Pools
              </Button>
              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn(
                    "capitalize px-3 py-1 cursor-pointer hover:opacity-80 transition-opacity",
                    params.protocol === "soroswap" && "bg-purple-500/10 text-purple-500 border-purple-500/20",
                    params.protocol === "blend" && "bg-green-500/10 text-green-500 border-green-500/20",
                    params.protocol === "phoenix" && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                    params.protocol === "aqua" && "bg-pink-500/10 text-pink-500 border-pink-500/20"
                  )}
                  onClick={() => {
                    const protocolPath = params.protocol === 'aqua' ? 'aquarius' : params.protocol;
                    router.push(`/pools/${protocolPath}`);
                  }}
                >
                  {getProtocolDisplay(params.protocol)}
                </Badge>
                <h1 className="text-xl font-bold tracking-tight">{poolData.market}</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => handleCopy(window.location.href)}
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                {copyFeedback === 'Copied!' ? 'Copied!' : 'Share'}
              </Button>
              <Button
                variant="default"
                size="sm"
                className="gap-2"
                onClick={() => window.open(`https://app.${params.protocol}.finance/pool/${poolData.market}`, '_blank')}
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                Add Liquidity
              </Button>
            </div>
          </div>
        </header>

        {/* Toolbar for chart style and indicators */}
        <div className="flex items-center mt-4 w-full justify-between flex-wrap gap-2">
          {/* Left: Switch Base Price */}
          <div className="flex items-center gap-2">
            <Button variant={inverted ? 'default':'secondary'} onClick={()=>setInverted(!inverted)}>
              Switch Base Price
            </Button>
          </div>

          {/* Middle: Indicators */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <Button variant={showMACD ? 'default' : 'secondary'} onClick={() => setShowMACD(!showMACD)}>
              MACD
            </Button>
            <Button variant={showRSI ? 'default' : 'secondary'} onClick={() => setShowRSI(!showRSI)}>
              RSI
            </Button>
            <Button variant={showSMA ? 'default' : 'secondary'} onClick={() => setShowSMA(!showSMA)}>
              SMA
            </Button>
            <Button variant={showEMA ? 'default':'secondary'} onClick={()=>setShowEMA(!showEMA)}>
              EMA
            </Button>
            <Button variant={showBollinger ? 'default':'secondary'} onClick={()=>setShowBollinger(!showBollinger)}>
              Bollinger
            </Button>
          </div>

          {/* Right: Chart style toggles */}
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <Button variant={chartStyle === 'candlestick' ? 'default' : 'secondary'} onClick={() => setChartStyle('candlestick')}>
              Candlestick
            </Button>
            <Button variant={chartStyle === 'line' ? 'default' : 'secondary'} onClick={() => setChartStyle('line')}>
              Line
            </Button>
            <Button variant={chartStyle === 'area' ? 'default' : 'secondary'} onClick={() => setChartStyle('area')}>
              Area
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col py-6 gap-6">
          {/* Chart Section */}
          <section className="h-[400px] lg:h-[500px] rounded-lg border bg-card overflow-hidden" aria-label="Price & Volume Chart">
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-border flex items-center justify-between bg-card">
                <div className="flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" aria-hidden="true" />
                  Price & Volume
                </div>
                <Select value={period} onValueChange={(val: PeriodOption) => setPeriod(val)}>
                  <SelectTrigger className="w-[100px]" aria-label="Select time period">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    {PERIOD_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
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
                      <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" aria-hidden="true" />
                      <p className="text-sm text-muted-foreground">
                        {chartError}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Pool Details Section */}
          <section className="flex-1" aria-label="Pool Details">
            <Tabs defaultValue="overview" className="h-full">
              <TabsList className="w-full justify-start h-9 bg-muted rounded-lg p-1">
                <TabsTrigger value="overview" className="rounded-md px-3 py-1.5">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="risk" className="rounded-md px-3 py-1.5">
                  Risk
                </TabsTrigger>
                <TabsTrigger value="contract" className="rounded-md px-3 py-1.5">
                  Contract
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 space-y-6">
                <TabsContent value="overview" className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <StatCard
                      title="24h Volume"
                      value={`$${Number(poolData.volume).toLocaleString()}`}
                      tooltip="Total trading volume in the last 24 hours"
                      icon={<BarChart3 className="h-4 w-4 text-primary" />}
                    />
                    <StatCard
                      title="Total Value Locked"
                      value={`$${Number(poolData.totalValueLocked).toLocaleString()}`}
                      tooltip="Total value of assets locked in the pool"
                      icon={<Lock className="h-4 w-4 text-primary" />}
                    />
                  </div>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <StatCard
                      title="Total Fees"
                      value={`$${Number(poolData.fees).toLocaleString()}`}
                      tooltip="Total fees earned by liquidity providers"
                      icon={<Settings className="h-4 w-4 text-primary" />}
                    />
                    <StatCard
                      title="Current APR"
                      value={poolData.apr}
                      tooltip="Estimated annual percentage rate"
                      icon={<LineChart className="h-4 w-4 text-primary" />}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="risk" className="mt-0 space-y-4">
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2 bg-muted/50 border-b border-border">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                        Risk Analysis
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                          <div className="text-center space-y-4">
                            <Badge
                              variant={Number(poolData.riskScore) <= 50 ? "default" : "destructive"}
                              className="px-6 py-3 text-xl font-semibold"
                            >
                              {Number(poolData.riskScore).toFixed(2)}
                            </Badge>
                            <p className="text-sm text-muted-foreground">
                              {Number(poolData.riskScore) <= 50 ? "Low Risk Pool" : "High Risk Pool"}
                            </p>
                          </div>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <StatCard
                            title="Volatility"
                            value={`${(Number(poolData.volume) / Number(poolData.totalValueLocked) * 100).toFixed(2)}%`}
                            tooltip="Price volatility indicator"
                            icon={<LineChart className="h-4 w-4 text-primary" />}
                          />
                          <StatCard
                            title="Liquidity Depth"
                            value={`$${Number(poolData.totalValueLocked).toLocaleString()}`}
                            tooltip="Measure of pool liquidity"
                            icon={<Lock className="h-4 w-4 text-primary" />}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="contract" className="mt-0 space-y-4">
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2 bg-muted/50 border-b border-border">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <FileCode className="h-5 w-5 text-primary" aria-hidden="true" />
                        Contract Information
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        <div className="flex items-center gap-2 bg-muted p-4 rounded-lg">
                          <code className="text-sm flex-1 break-all font-mono">
                            {poolData.market}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => { navigator.clipboard.writeText(poolData.market)}}
                            aria-label="Copy contract address"
                          >
                            <Copy className="h-4 w-4" aria-hidden="true" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(`https://stellar.expert/explorer/public/contract/${poolData.market}`, '_blank')}
                            aria-label="View on Explorer"
                          >
                            <ExternalLink className="h-4 w-4" aria-hidden="true" />
                          </Button>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2">
                          <StatCard
                            title="Protocol Version"
                            value={`${getProtocolDisplay(params.protocol)} V1`}
                            tooltip="Current protocol version"
                            icon={<Tag className="h-4 w-4 text-primary" />}
                          />
                          <StatCard
                            title="Fee Model"
                            value="Static"
                            tooltip="Type of fee model used"
                            icon={<Settings className="h-4 w-4 text-primary" />}
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </section>
        </main>
      </div>
    </div>
  );
}
