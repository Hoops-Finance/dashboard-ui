"use client";

import React, { useState, useEffect } from "react";
import { WalletConnection } from "../../components/Dashboard/WalletConnection";
import { Metrics } from "../../components/Dashboard/Metrics";
import { TableComponent } from "../../components/Dashboard/TableComponent";
import DetailedInfo from "../../components/DetailedInfo";
import { ExplorerTableData, ProcessedToken, PoolRiskApiResponseObject, Pair, GlobalMetrics } from "utils/newTypes";
import { fetchData } from "../../utils/FetchData";

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

  const fetchMetrics = (selectedPeriod: typeof period) => {
    fetch(`https://api.hoops.finance/getmetrics?period=${selectedPeriod}`)
      .then((response) => response.json())
      .then((data: GlobalMetrics) => {
        setGlobalMetrics(data);
      })
      .catch((error) => console.error("Failed to fetch global metrics", error));
  };

  useEffect(() => {
    fetchData(setExplorerTableData, setProcessedTokens, setLoading);
    fetchMetrics(period); // Fetch metrics for the initial period
  }, []);

  useEffect(() => {
    fetchMetrics(period); // Fetch metrics when the period changes
  }, [period]);

  return (
    <div className="mt-10 min-h-screen bg-white dark:bg-gray-900 p-4 md:p-8 font-inter">
      <div className="w-full max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 gap-8 mb-8">
          <div className="hidden">
            <WalletConnection />
          </div>
          {globalMetrics && (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
              <Metrics {...globalMetrics} period={period} setPeriod={setPeriod} />
            </div>
          )}
        </div>
        {/* Display DetailedInfo if a pair is selected */}
        {selectedPairData && selectedPoolRiskData && <DetailedInfo pairData={selectedPairData} poolRiskData={selectedPoolRiskData} processedTokens={processedTokens} />}

        {/* Pass the fetched data to TableComponent */}
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
      {/* Loading state */}
      {loading && <div>Loading data...</div>}
    </div>
  );
}
