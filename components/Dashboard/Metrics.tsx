import React from "react";
import { MetricCard, Card } from "../ui";
import { GlobalMetrics } from "../../utils/newTypes";

interface MetricsProps extends GlobalMetrics {
  setPeriod: React.Dispatch<React.SetStateAction<"24h" | "7d" | "14d" | "30d" | "90d" | "180d" | "360d">>;
}

export function Metrics({ 
  totalValueLocked, 
  poolsIndexed, 
  totalVolume, 
  liquidityProviders, 
  top5volume, 
  top5tvl, 
  top5apr, 
  period, 
  setPeriod 
}: MetricsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-sm font-medium text-muted-foreground">TVL</h3>
        <p className="text-2xl font-bold text-foreground mt-2">{`$${totalValueLocked.toLocaleString()}`}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Total Value Locked (TVL) represents the total amount of assets locked in the protocol.
        </p>
      </MetricCard>

      <MetricCard className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-sm font-medium text-muted-foreground">Pools Indexed</h3>
        <p className="text-2xl font-bold text-foreground mt-2">{poolsIndexed}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Number of liquidity pools indexed in the protocol.
        </p>
      </MetricCard>

      <MetricCard className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-sm font-medium text-muted-foreground">Total Volume</h3>
        <p className="text-2xl font-bold text-foreground mt-2">{`$${totalVolume.toLocaleString()}`}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Total trading volume across all pools.
        </p>
      </MetricCard>

      <MetricCard className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-sm font-medium text-muted-foreground">Liquidity Providers</h3>
        <p className="text-2xl font-bold text-foreground mt-2">{liquidityProviders}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Unique liquidity providers who have contributed to the protocol.
        </p>
      </MetricCard>

      <MetricCard className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-sm font-medium text-muted-foreground">Top 5 Volume</h3>
        <p className="text-2xl font-bold text-foreground mt-2">{`$${top5volume.toLocaleString()}`}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Trading volume of the top 5 pools with the lowest risk scores.
        </p>
      </MetricCard>

      <MetricCard className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-sm font-medium text-muted-foreground">Top 5 TVL</h3>
        <p className="text-2xl font-bold text-foreground mt-2">{`$${top5tvl.toLocaleString()}`}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Total Value Locked of the top 5 pools with the lowest risk scores.
        </p>
      </MetricCard>

      <MetricCard className="bg-card text-card-foreground p-6 rounded-lg shadow-sm hover:shadow-md transition-all duration-200">
        <h3 className="text-sm font-medium text-muted-foreground">Top 5 APR</h3>
        <p className="text-2xl font-bold text-foreground mt-2">{`${top5apr.toFixed(2)}%`}</p>
        <p className="text-xs text-muted-foreground mt-1">
          Average Annual Percentage Rate (APR) for the top 5 pools.
        </p>
      </MetricCard>

      <Card className="bg-card text-card-foreground p-6 rounded-lg shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Select Period</h3>
        <select 
          value={period} 
          onChange={(e) => setPeriod(e.target.value as MetricsProps["period"])} 
          className="w-full p-2 bg-background text-foreground border border-input rounded-md focus:ring-2 focus:ring-ring focus:border-input"
        >
          <option value="24h">24h</option>
          <option value="7d">7d</option>
          <option value="14d">14d</option>
          <option value="30d">30d</option>
          <option value="90d">90d</option>
          <option value="180d">180d</option>
          <option value="360d">360d</option>
        </select>
      </Card>
    </div>
  );
}
