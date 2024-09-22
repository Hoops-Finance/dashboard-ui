// Dashboard/page.tsx

"use client";

import React, { useState, useEffect } from "react";
import { WalletConnection } from "../../components/Dashboard/WalletConnection";
import { Metrics } from "../../components/Dashboard/Metrics";
import { TableComponent } from "../../components/Dashboard/TableComponent";
import DetailedInfo from "../../components/DetailedInfo"; // Import DetailedInfo
import { ExplorerTableData, ProcessedToken, PoolRiskApiResponseObject, PairApiResponseObject, Pair } from "utils/newTypes";
import { fetchData } from "../../utils/FetchData";

export default function Dashboard() {
  const [totalTVL, setTotalTVL] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalPools, setTotalPools] = useState(0);
  const [explorerData, setExplorerTableData] = useState<ExplorerTableData | null>(null);
  const [processedTokens, setProcessedTokens] = useState<ProcessedToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingPools, setLoadingPools] = useState(false);
  const [poolData, setPoolData] = useState<PoolRiskApiResponseObject[]>([]);
  const [selectedPairData, setSelectedPairData] = useState<Pair | null>(null);
  const [selectedPoolRiskData, setSelectedPoolRiskData] = useState<PoolRiskApiResponseObject | null>(null);

  // Metrics will derive from explorerData
  useEffect(() => {
    const calculateMetrics = () => {
      if (explorerData) {
        const totalTVL = explorerData.pools.reduce((acc, pool) => acc + (pool.tvl || 0), 0);
        setTotalTVL(totalTVL);
        setTotalTokens(explorerData.tokens.length);
        setTotalPools(explorerData.pools.length);
      }
    };
    calculateMetrics();
  }, [explorerData]);

  // Fetch data and pass it to TableComponent and Metrics
  useEffect(() => {
    fetchData(setExplorerTableData, setProcessedTokens, setLoading);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8 font-inter">
      <div className="container mx-auto max-w-screen-xl px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <WalletConnection />
          <Metrics totalTVL={totalTVL} totalTokens={totalTokens} totalPools={totalPools} totalProtocols={3} />
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
    </div>
  );
}
