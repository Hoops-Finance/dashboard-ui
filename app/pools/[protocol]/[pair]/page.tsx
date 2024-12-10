"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createChart, ColorType, UTCTimestamp, IChartApi } from "lightweight-charts";
import { fetchMarketCandles } from "@/utils/fetchCandles";
import { PoolRiskApiResponseObject } from "@/utils/newTypes";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BarChart3,
  ChevronRight,
  Copy,
  ExternalLink,
  FileCode,
  LineChart,
  Lock,
  Plus,
  Settings,
  Share2,
  Shield,
  Tag,
} from "lucide-react";
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

interface PageProps {
  params: { 
    protocol: string;
    pair: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

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

// Helper function to get display name for protocol
const getProtocolDisplay = (protocol: string): string => {
  return protocol.toLowerCase() === 'aqua' ? 'Aquarius' : 
         protocol.charAt(0).toUpperCase() + protocol.slice(1).toLowerCase();
};

export default function PoolPage({ params, searchParams }: PageProps) {
  const [period, setPeriod] = useState<PeriodOption>("24h");
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [chartError, setChartError] = useState<string | null>(null);
  const router = useRouter();
  const [chart, setChart] = useState<IChartApi | null>(null);
  const [poolData, setPoolData] = useState<PoolRiskApiResponseObject | null>(null);

  // Fetch pool data
  useEffect(() => {
    const loadPoolData = async () => {
      try {
        setError(null);
        
        // Convert URL-safe pair back to market format
        const marketParam = params.pair.replace(/-/g, '/');
        const protocolParam = params.protocol.toLowerCase();
        
        const response = await fetch(`/api/pools?market=${marketParam}&protocol=${protocolParam}`);
        if (!response.ok) {
          throw new Error('Failed to fetch pool data');
        }
        
        const data = await response.json();
        if (!data || data.length === 0) {
          throw new Error('Pool not found');
        }
        
        setPoolData(data[0]); // Take the first matching pool
      } catch (error) {
        console.error('Error fetching pool data:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      }
    };

    loadPoolData();
  }, [params.pair, params.protocol]);

  // Initialize and update chart
  useEffect(() => {
    if (!chartContainerRef.current || !poolData) return;

    const initChart = async () => {
      try {
        setChartError(null);
        
        const container = chartContainerRef.current;
        if (!container) return;

        const chartInstance = createChart(container, {
          layout: {
            background: { type: ColorType.Solid, color: 'transparent' },
            textColor: '#64748b',
          },
          grid: {
            vertLines: { color: '#e2e8f0' },
            horzLines: { color: '#e2e8f0' },
          },
          width: container.clientWidth,
          height: 400,
        });

        setChart(chartInstance);

        // Calculate time range based on period
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
          case '90d':
            from = to - 90 * 24 * 60 * 60;
            break;
          case '180d':
            from = to - 180 * 24 * 60 * 60;
            break;
          case '360d':
            from = to - 360 * 24 * 60 * 60;
            break;
          default:
            from = to - 7 * 24 * 60 * 60;
        }

        // Get token pair from market
        const [token0, token1] = poolData.market.split('/');

        try {
          // Fetch candle data
          const candleData = await fetchMarketCandles(token0, token1, from, to);
          
          if (!candleData || candleData.length === 0) {
            throw new Error('No chart data available');
          }

          // Create volume series
          const volumeSeries = chartInstance.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
              type: 'volume',
            },
            priceScaleId: '',
          });

          // Set volume data
          volumeSeries.setData(
            candleData.map((candle) => ({
              time: candle.time,
              value: Number(poolData.volume),
              color: '#26a69a',
            }))
          );

          chartInstance.timeScale().fitContent();
        } catch (error) {
          console.error('Error loading chart data:', error);
          setChartError('Unable to load chart data');
        }

        // Handle resize
        const handleResize = () => {
          chartInstance.applyOptions({
            width: container.clientWidth,
          });
        };

        window.addEventListener('resize', handleResize);

        return () => {
          window.removeEventListener('resize', handleResize);
          chartInstance.remove();
        };
      } catch (error) {
        console.error('Error initializing chart:', error);
        setChartError('Failed to initialize chart');
      }
    };

    initChart();
  }, [period, poolData]);

  const handlePeriodChange = (newPeriod: PeriodOption) => {
    setPeriod(newPeriod);
  };

  if (error) {
    return (
      <div className="container max-w-7xl mx-auto px-4 py-6">
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
      <div className="container max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground">Loading pool data...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6">
        {/* Header Section */}
        <div className="sticky top-[4.5rem] z-20 bg-background/80 backdrop-blur-sm pb-4 border-b border-border">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <Badge 
                variant="outline" 
                className={cn(
                  "capitalize px-3 py-1",
                  params.protocol === "soroswap" && "bg-purple-500/10 text-purple-500 border-purple-500/20",
                  params.protocol === "blend" && "bg-green-500/10 text-green-500 border-green-500/20",
                  params.protocol === "phoenix" && "bg-orange-500/10 text-orange-500 border-orange-500/20",
                  params.protocol === "aqua" && "bg-pink-500/10 text-pink-500 border-pink-500/20"
                )}
              >
                {getProtocolDisplay(params.protocol)}
              </Badge>
              <h1 className="text-2xl font-bold tracking-tight">{poolData.market}</h1>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" className="gap-2">
                <Share2 className="h-4 w-4" />
                Share
              </Button>
              <Button variant="default" size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                Add Liquidity
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-6 space-y-8">
          {/* Chart Section */}
          <div className="relative isolate">
            <Card className="border-none shadow-md overflow-hidden">
              <CardHeader className="pb-2 bg-muted/50 border-b border-border">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <LineChart className="h-5 w-5 text-primary" aria-hidden="true" />
                    Volume Chart
                  </CardTitle>
                  <Select value={period} onValueChange={handlePeriodChange}>
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
              </CardHeader>
              <CardContent className="p-0">
                <div 
                  className="w-full h-[400px] relative bg-background pointer-events-auto" 
                  ref={chartContainerRef}
                >
                  {chartError ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <AlertCircle className="h-5 w-5" />
                        <p>{chartError}</p>
                      </div>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-border" />
            </div>
          </div>

          {/* Tabs Section */}
          <div className="relative">
            <Tabs defaultValue="overview" className="space-y-6">
              <div className="sticky top-[8rem] z-10 bg-background/80 backdrop-blur-sm pb-4">
                <TabsList className="inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground">
                  <TabsTrigger value="overview" className="rounded-md px-3 py-1.5 text-sm font-medium">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="risk" className="rounded-md px-3 py-1.5 text-sm font-medium">
                    Risk
                  </TabsTrigger>
                  <TabsTrigger value="contract" className="rounded-md px-3 py-1.5 text-sm font-medium">
                    Contract
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Content */}
              <div className="space-y-6">
                <TabsContent value="overview" className="mt-0 space-y-4">
                  <Card className="border-none shadow-md">
                    <CardHeader className="pb-2 bg-muted/50 border-b border-border">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                          Pool Overview
                        </CardTitle>
                        <Select value={period} onValueChange={handlePeriodChange}>
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
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid gap-6">
                        <div className="grid gap-4 md:grid-cols-2">
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
                        <div className="grid gap-4 md:grid-cols-2">
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
                      </div>
                    </CardContent>
                  </Card>
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
                        <div className="grid gap-4">
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
                            onClick={() => navigator.clipboard.writeText(poolData.market)}
                          >
                            <Copy className="h-4 w-4" />
                            <span className="sr-only">Copy contract address</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => window.open(`https://stellar.expert/explorer/public/contract/${poolData.market}`, '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                            <span className="sr-only">View on Explorer</span>
                          </Button>
                        </div>
                        <div className="grid gap-4">
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
          </div>
        </div>
      </div>
    </div>
  );
} 