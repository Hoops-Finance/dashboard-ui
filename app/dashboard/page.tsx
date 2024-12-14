"use client";

import React, { useState, useEffect, useCallback } from "react";
import { WalletConnection } from "@/components/Dashboard/WalletConnection";
import { Metrics } from "@/components/Dashboard/Metrics";
import { TableComponent } from "@/components/Dashboard/TableComponent";
import DetailedInfo from "@/components/DetailedInfo";
import { ExplorerTableData, ProcessedToken, PoolRiskApiResponseObject, Pair, GlobalMetrics } from "utils/newTypes";
import { fetchData } from "@/utils/FetchData";

export default function Dashboard() {
  const [explorerData, setExplorerTableData] = useState<ExplorerTableData | null>(null);
  const [processedTokens, setProcessedTokens] = useState<ProcessedToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPools, setLoadingPools] = useState(false);
  const [poolData, setPoolData] = useState<PoolRiskApiResponseObject[]>([]);
  const [selectedPairData, setSelectedPairData] = useState<Pair | null>(null);
  const [selectedPoolRiskData, setSelectedPoolRiskData] = useState<PoolRiskApiResponseObject | null>(null);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [period, setPeriod] = useState<"24h" | "7d" | "14d" | "30d" | "90d" | "180d" | "360d">("14d");

  const fetchMetrics = useCallback((selectedPeriod: typeof period) => {
    fetch(`https://api.hoops.finance/getmetrics?period=${selectedPeriod}`)
      .then((response) => response.json())
      .then((data: GlobalMetrics) => {
        setGlobalMetrics(data);
      })
      .catch((error) => console.error("Failed to fetch global metrics", error));
  }, []);

  useEffect(() => {
    fetchData(setExplorerTableData, setProcessedTokens, setLoading);
    fetchMetrics(period);
  }, [fetchMetrics, period]);

  useEffect(() => {
    fetchMetrics(period);
  }, [fetchMetrics, period]);

  return (
    <div className="min-h-screen bg-background">
      <main className="pt-[120px]">
        <div className="max-w-screen-2xl mx-auto px-4">
          <div className="space-y-8">
            <div className="hidden">
              <WalletConnection />
            </div>
            
            {globalMetrics && (
              <Metrics 
                totalValueLocked={globalMetrics.totalValueLocked}
                poolsIndexed={globalMetrics.poolsIndexed}
                totalVolume={globalMetrics.totalVolume}
                liquidityProviders={globalMetrics.liquidityProviders}
                top5volume={globalMetrics.top5volume}
                top5tvl={globalMetrics.top5tvl}
                top5apr={globalMetrics.top5apr}
                period={period}
                setPeriod={setPeriod}
                bestaprpair={globalMetrics.bestaprpair || ''}
                bestapraddress={globalMetrics.bestapraddress || ''}
              />
            )}

            {selectedPairData && selectedPoolRiskData && (
              <DetailedInfo 
                pairData={selectedPairData} 
                poolRiskData={selectedPoolRiskData} 
                processedTokens={processedTokens} 
              />
            )}

            <TableComponent
              explorerData={explorerData}
              processedTokens={processedTokens}
              poolData={poolData}
              setPoolData={setPoolData}
              loadingPools={loadingPools}
              setLoadingPools={setLoadingPools}
              onSelectPair={(pairData: Pair, poolRiskData: PoolRiskApiResponseObject) => {
                setSelectedPairData(pairData);
                setSelectedPoolRiskData(poolRiskData);
              }}
            />
          </div>
        </div>

        {loading && (
          <div className="fixed inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <div className="text-foreground">Loading data...</div>
          </div>
        )}
      </main>
    </div>
  );
}
