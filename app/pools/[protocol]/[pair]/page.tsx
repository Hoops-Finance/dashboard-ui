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
  Wallet,
  Lock,
  DollarSign,
  Percent,
  TrendingUp,
  LineChart,
  Activity,
  FileCode,
  Tag,
  Settings,
  Waves,
  Share2,
  Plus
} from "lucide-react";
import { createChart, ColorType, UTCTimestamp, IChartApi } from "lightweight-charts";
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

interface StatCardProps {
  title: string;
  value: string | number;
  tooltip?: string;
  valueColor?: string;
  icon?: React.ReactNode;
}

const StatCard = ({ title, value, tooltip, valueColor, icon }: StatCardProps) => (
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
      <p className={cn("text-2xl font-bold tracking-tight", valueColor)}>
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
  const [poolData, setPoolData] = useState({
    volume: "1000000",
    totalValueLocked: "5000000",
    fees: "10000",
    apr: "12.5",
    riskScore: "35",
    market: params.pair.replace(/-/g, '/'),
  });

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const handleResize = () => {
      if (chart) {
        chart.applyOptions({
          width: chartContainerRef.current?.clientWidth ?? 0,
        });
      }
    };

    const chartInstance = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#64748b',
      },
      grid: {
        vertLines: { color: '#e2e8f0' },
        horzLines: { color: '#e2e8f0' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 400,
    });

    setChart(chartInstance);

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      chartInstance.remove();
    };
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Header Section */}
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

        {/* Main Content Grid */}
        <div className="grid gap-6 grid-cols-1">
          {/* Chart Section */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-2 bg-muted/50">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <LineChart className="h-5 w-5 text-primary" aria-hidden="true" />
                  Volume Chart
                </CardTitle>
                <Select value={period} onValueChange={setPeriod}>
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
            <CardContent>
              <div className="w-full h-[400px] relative" ref={chartContainerRef}>
                {chartError && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-5 w-5" />
                      <p>{chartError}</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Tabs defaultValue="overview" className="space-y-6">
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

            <TabsContent value="overview" className="mt-6 space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2 bg-muted/50">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" aria-hidden="true" />
                    Pool Overview
                  </CardTitle>
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
                        value={`${poolData.apr}%`}
                        tooltip="Estimated annual percentage rate"
                        valueColor={Number(poolData.apr) >= 0 ? "text-green-500" : "text-red-500"}
                        icon={<LineChart className="h-4 w-4 text-primary" />}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="risk" className="mt-6 space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2 bg-muted/50">
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

            <TabsContent value="contract" className="mt-6 space-y-4">
              <Card className="border-none shadow-md">
                <CardHeader className="pb-2 bg-muted/50">
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
          </Tabs>
        </div>
      </div>
    </div>
  );
} 