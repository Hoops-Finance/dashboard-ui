import React from "react";
import { MetricCard, Card } from "../ui";
import { GlobalMetrics } from "../../utils/newTypes";

interface MetricsProps extends GlobalMetrics {
  setPeriod: React.Dispatch<React.SetStateAction<"24h" | "7d" | "14d" | "30d" | "90d" | "180d" | "360d">>;
}

export function Metrics({ totalValueLocked, poolsIndexed, totalVolume, liquidityProviders, top5volume, top5tvl, top5apr, period, setPeriod }: MetricsProps) {
  return (
    <React.Fragment>
      <MetricCard title="Total Value Locked (TVL) represents the total amount of assets locked in the protocol.">
        <h3 className="metric-title">TVL</h3>
        <p className="metric-value">{`$${totalValueLocked.toLocaleString()}`}</p>
      </MetricCard>

      <MetricCard title="Number of liquidity pools indexed in the protocol.">
        <h3 className="metric-title">Pools Indexed</h3>
        <p className="metric-value">{poolsIndexed}</p>
      </MetricCard>

      <MetricCard title="Total trading volume across all pools.">
        <h3 className="metric-title">Total Volume</h3>
        <p className="metric-value">{`$${totalVolume.toLocaleString()}`}</p>
      </MetricCard>

      <MetricCard title="Unique liquidity providers who have contributed to the protocol.">
        <h3 className="metric-title">Liquidity Providers</h3>
        <p className="metric-value">{liquidityProviders}</p>
      </MetricCard>

      <MetricCard title="Trading volume of the top 5 pools with the lowest risk scores.">
        <h3 className="metric-title">Top 5 Volume</h3>
        <p className="metric-value">{`$${top5volume.toLocaleString()}`}</p>
      </MetricCard>

      <MetricCard title="Total Value Locked of the top 5 pools with the lowest risk scores.">
        <h3 className="metric-title">Top 5 TVL</h3>
        <p className="metric-value">{`$${top5tvl.toLocaleString()}`}</p>
      </MetricCard>

      <MetricCard title="Average Annual Percentage Rate (APR) for the top 5 pools.">
        <h3 className="metric-title">Top 5 APR</h3>
        <p className="metric-value">{`${top5apr.toFixed(2)}%`}</p>
      </MetricCard>

      <Card className="card-custom">
        <h3 className="metric-title">Select Period</h3>
        <select value={period} onChange={(e) => setPeriod(e.target.value as MetricsProps["period"])} className="select-base">
          <option value="24h">24h</option>
          <option value="7d">7d</option>
          <option value="14d">14d</option>
          <option value="30d">30d</option>
          <option value="90d">90d</option>
          <option value="180d">180d</option>
          <option value="360d">360d</option>
        </select>
      </Card>
    </React.Fragment>
  );
}
