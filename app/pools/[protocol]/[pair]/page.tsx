"use client";

import { useRouter } from "next/navigation";
import { useRef, useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  BarChart3,
  ChevronRight,
  Shield,
  Copy,
  ExternalLink,
  Wallet
} from "lucide-react";
import { createChart, ColorType, UTCTimestamp } from "lightweight-charts";
import { fetchMarketCandles } from "@/utils/fetchCandles";
import { PoolRiskApiResponseObject } from "@/utils/newTypes";
import { cn } from "@/lib/utils";

interface PageProps {
  params: { 
    protocol: string;
    pair: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function PoolPage({ params, searchParams }: PageProps) {
  const router = useRouter();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [poolData, setPoolData] = useState<PoolRiskApiResponseObject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);

  // Get period from URL or default to 7d
  const period = typeof searchParams.period === 'string' ? searchParams.period : '7d';

  // Convert URL-safe pair back to market format
  const market = params.pair.replace(/-/g, '/');

  // Update URL when period changes
  const handlePeriodChange = (newPeriod: string) => {
    router.push(`/pools/${params.protocol}/${params.pair}?period=${newPeriod}`);
  };

  // Copy to clipboard function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Fetch pool data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch pool data with protocol filter
        const response = await fetch(`/api/pools?market=${market}&protocol=${params.protocol}&period=${period}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (!Array.isArray(result) || result.length === 0) {
          throw new Error('Pool not found');
        }

        // Find the exact pool match with protocol
        const pool = result.find(p => 
          p.market.toLowerCase() === market.toLowerCase() && 
          p.protocol.toLowerCase() === params.protocol.toLowerCase()
        );

        if (!pool) {
          throw new Error('Pool not found');
        }

        setPoolData(pool);
      } catch (error) {
        console.error('Error fetching pool data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
        setPoolData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [market, period, params.protocol]);

  // Initialize and update chart
  useEffect(() => {
    if (!chartContainerRef.current || !poolData) return;

    const initChart = async () => {
      try {
        setChartError(null);
        
        // Type assertion since we already checked for null
        const container = chartContainerRef.current as HTMLElement;
        
        const chart = createChart(container, {
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#999',
          },
          grid: {
            vertLines: { color: '#222' },
            horzLines: { color: '#222' },
          },
          width: container.clientWidth,
          height: 400,
        });

        const [token0, token1] = market.split('/');
        const to = Math.floor(Date.now() / 1000);
        let from;
        
        switch (period) {
          case '24h':
            from = to - 24 * 60 * 60;
            break;
          case '7d':
            from = to - 7 * 24 * 60 * 60;
            break;
          case '30d':
            from = to - 30 * 24 * 60 * 60;
            break;
          default:
            from = to - 7 * 24 * 60 * 60;
        }

        const candleData = await fetchMarketCandles(token0, token1, from, to);
        if (!candleData || !Array.isArray(candleData) || candleData.length === 0) {
          throw new Error('No chart data available');
        }

        const volumeSeries = chart.addHistogramSeries({
          color: '#26a69a',
          priceFormat: {
            type: 'volume',
          },
          priceScaleId: '',
        });

        // Type assertion for candle data
        type CandleDataType = {
          time: number;
          open: number;
          high: number;
          low: number;
          close: number;
          volume: number;
        };

        volumeSeries.setData(candleData.map((candle: CandleDataType) => ({
          time: (candle.time || Math.floor(Date.now() / 1000)) as UTCTimestamp,
          value: Number(candle.volume || 0),
          color: (Number(candle.close) >= Number(candle.open)) ? '#26a69a' : '#ef5350',
        })));

        chart.timeScale().fitContent();

        const handleResize = () => {
          chart.applyOptions({
            width: container.clientWidth,
          });
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          chart.remove();
        };
      } catch (error) {
        console.error('Error initializing chart:', error);
        setChartError('Failed to load chart data');
      }
    };

    initChart();
  }, [market, period, poolData]);

  if (loading) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground">Loading pool data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-destructive flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!poolData) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground">Pool not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-4 space-y-6">
      {/* Breadcrumb with better accessibility */}
      <nav aria-label="Breadcrumb" className="flex items-center space-x-2 text-muted-foreground text-sm">
        <Button 
          variant="ghost" 
          className="h-6 px-2 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => router.push('/pools')}
          aria-label="Back to pools list"
        >
          Pools
        </Button>
        <ChevronRight className="h-4 w-4" aria-hidden="true" />
        <span className="text-foreground font-medium capitalize" aria-current="page">
          {poolData.protocol} / {poolData.market}
        </span>
      </nav>

      {/* Header with enhanced styling */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{poolData.market}</h1>
            <Badge 
              variant="outline" 
              className={cn(
                "capitalize transition-colors",
                poolData.protocol === "soroswap" && "bg-purple-500/10 text-purple-500 border-purple-500/20 hover:bg-purple-500/20",
                poolData.protocol === "blend" && "bg-green-500/10 text-green-500 border-green-500/20 hover:bg-green-500/20",
                poolData.protocol === "phoenix" && "bg-orange-500/10 text-orange-500 border-orange-500/20 hover:bg-orange-500/20",
                poolData.protocol === "aqua" && "bg-pink-500/10 text-pink-500 border-pink-500/20 hover:bg-pink-500/20"
              )}
              title={`Protocol: ${poolData.protocol === "aqua" ? "Aquarius" : poolData.protocol}`}
            >
              {poolData.protocol === "aqua" ? "Aquarius" : poolData.protocol}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            24h Volume: <span className="font-medium">${Number(poolData.volume).toLocaleString()}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 self-end md:self-auto">
          <Button variant="outline" className="gap-2 hover:bg-primary/5">
            <Wallet className="h-4 w-4" aria-hidden="true" />
            Add Liquidity
          </Button>
          <Select value={period} onValueChange={handlePeriodChange}>
            <SelectTrigger className="w-[100px]" aria-label="Select time period">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24H</SelectItem>
              <SelectItem value="7d">7D</SelectItem>
              <SelectItem value="30d">30D</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <hr className="border-border my-6" />

      {/* Chart Card with improved styling */}
      <Card className="overflow-hidden border-none shadow-md">
        <CardHeader className="pb-2 bg-muted/50">
          <CardTitle className="text-lg flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
            Volume Chart
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {chartError ? (
            <div className="w-full h-[400px] flex items-center justify-center bg-muted/5">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
                <span>{chartError}</span>
              </div>
            </div>
          ) : (
            <div ref={chartContainerRef} className="w-full h-[400px]" />
          )}
        </CardContent>
      </Card>

      {/* Tabs with enhanced styling */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
          <TabsTrigger 
            value="overview"
            className="rounded-md px-4 py-2 hover:bg-background/80 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            Overview
          </TabsTrigger>
          <TabsTrigger 
            value="risk"
            className="rounded-md px-4 py-2 hover:bg-background/80 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            Risk
          </TabsTrigger>
          <TabsTrigger 
            value="contract"
            className="rounded-md px-4 py-2 hover:bg-background/80 hover:text-foreground data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm transition-all"
          >
            Contract
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab Content */}
        <TabsContent value="overview">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2 bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                Pool Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-8">
                {/* Volume Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">Volume Metrics</h3>
                    <span 
                      className="text-muted-foreground cursor-help" 
                      title="Key volume metrics for this pool"
                    >
                      ⓘ
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                      <span className="text-sm font-medium">24h Volume</span>
                      <span className="font-medium">${Number(poolData.volume).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                      <span className="text-sm font-medium">Total Value Locked</span>
                      <span className="font-medium">${Number(poolData.totalValueLocked).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Fees Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">Fee Metrics</h3>
                    <span 
                      className="text-muted-foreground cursor-help" 
                      title="Fee structure and earnings"
                    >
                      ⓘ
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                      <span className="text-sm font-medium">Total Fees</span>
                      <span className="font-medium">${Number(poolData.fees).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                      <span className="text-sm font-medium">Fee Tier</span>
                      <span className="font-medium">
                        {(Number(poolData.fees) / Number(poolData.volume) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Returns Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">Performance Metrics</h3>
                    <span 
                      className="text-muted-foreground cursor-help" 
                      title="Pool performance indicators"
                    >
                      ⓘ
                    </span>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                      <span className="text-sm font-medium">Current APR</span>
                      <span className={cn(
                        "font-medium",
                        Number(poolData.apr) >= 0 ? "text-green-500" : "text-red-500"
                      )}>
                        {poolData.apr}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                      <span className="text-sm font-medium">Volume/TVL Ratio</span>
                      <span className="font-medium">
                        {(Number(poolData.volume) / Number(poolData.totalValueLocked)).toFixed(3)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Tab Content */}
        <TabsContent value="risk">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2 bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                Risk Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-8">
                {/* Risk Score */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">Risk Score</h3>
                    <span 
                      className="text-muted-foreground cursor-help" 
                      title="Overall risk assessment score"
                    >
                      ⓘ
                    </span>
                  </div>
                  <div className="flex items-center justify-center p-8 bg-muted rounded-lg">
                    <div className="text-center">
                      <Badge 
                        variant={Number(poolData.riskScore) <= 50 ? "default" : "destructive"}
                        className="px-6 py-3 text-xl font-semibold"
                      >
                        {Number(poolData.riskScore).toFixed(2)}
                      </Badge>
                      <p className="mt-3 text-sm text-muted-foreground">
                        {Number(poolData.riskScore) <= 50 ? "Low Risk Pool" : "High Risk Pool"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Risk Metrics */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">Risk Metrics</h3>
                    <span 
                      className="text-muted-foreground cursor-help" 
                      title="Detailed risk indicators"
                    >
                      ⓘ
                    </span>
                  </div>
                  <div className="grid gap-4">
                    <div className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                      <span className="text-sm font-medium">Volatility</span>
                      <span className="font-medium">
                        {(Number(poolData.volume) / Number(poolData.totalValueLocked) * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                      <span className="text-sm font-medium">APR Stability</span>
                      <span className="font-medium">
                        {(Math.abs(Number(poolData.apr)) / 100).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                      <span className="text-sm font-medium">Liquidity Depth</span>
                      <span className="font-medium">
                        ${Number(poolData.totalValueLocked).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Contract Tab Content */}
        <TabsContent value="contract">
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2 bg-muted/50">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
                Contract Information
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-8">
                {/* Pool Address */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">Pool Address</h3>
                    <span 
                      className="text-muted-foreground cursor-help" 
                      title="Contract address on the blockchain"
                    >
                      ⓘ
                    </span>
                  </div>
                  <div className="flex items-center gap-2 bg-muted p-4 rounded-lg">
                    <code className="text-sm flex-1 break-all font-mono">
                      {poolData.market}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-background"
                      onClick={() => copyToClipboard(poolData.market)}
                      title="Copy address"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 hover:bg-background"
                      onClick={() => window.open(`https://stellar.expert/explorer/public/contract/${poolData.market}`, '_blank')}
                      title="View on Explorer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Protocol Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">Protocol</h3>
                    <span 
                      className="text-muted-foreground cursor-help" 
                      title="Protocol details and documentation"
                    >
                      ⓘ
                    </span>
                  </div>
                  <div className="flex items-center justify-between px-4 py-3 bg-muted rounded-lg">
                    <Badge 
                      variant="outline" 
                      className={cn(
                        "capitalize px-3 py-1",
                        poolData.protocol === "soroswap" && "bg-blue-500/10 text-blue-500 border-blue-500/20",
                        poolData.protocol === "phoenix" && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                        poolData.protocol === "aquarius" && "bg-green-500/10 text-green-500 border-green-500/20"
                      )}
                    >
                      {poolData.protocol}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-3 gap-2 hover:bg-background"
                      onClick={() => window.open(`https://${poolData.protocol}.org`, '_blank')}
                    >
                      View Protocol
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Implementation Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-foreground">Implementation</h3>
                    <span 
                      className="text-muted-foreground cursor-help" 
                      title="Technical implementation details"
                    >
                      ⓘ
                    </span>
                  </div>
                  <div className="grid gap-3">
                    <div className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                      <span className="text-sm font-medium">Version</span>
                      <span className="font-medium capitalize">{poolData.protocol} V1</span>
                    </div>
                    <div className="flex justify-between items-center px-4 py-3 bg-muted rounded-lg hover:bg-muted/70 transition-colors">
                      <span className="text-sm font-medium">Fee Model</span>
                      <span className="font-medium">Static</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 