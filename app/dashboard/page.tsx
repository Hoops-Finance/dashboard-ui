"use client";

import { useState, useEffect } from "react";
import { WalletConnection } from "../../components/Dashboard/WalletConnection";
import { Metrics } from "../../components/Dashboard/Metrics";
import { TableComponent } from "../../components/Dashboard/TableComponent";
import { Market, Pool, TokenDetails } from "utils/types";

export default function Dashboard() {
  const [totalTVL, setTotalTVL] = useState(0);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalPools, setTotalPools] = useState(0);

  // Fetch data from the TableComponent's API
  const fetchData = async () => {
    try {
      const [marketsResponse, pairsResponse, tokensResponse] = await Promise.all([
        fetch("https://api.v1.xlm.services/markets"),
        fetch("https://api.v1.xlm.services/pairs"),
        fetch("https://api.v1.xlm.services/tokens")
      ]);

      const marketsData: Market[] = await marketsResponse.json();
      console.log("marketsData", marketsData.length);
      const poolsData: Pool[] = await pairsResponse.json();
      const tokensData: TokenDetails[] = await tokensResponse.json();

      // Total TVL Calculation
      const totalTVL = poolsData.reduce((acc: number, pool: Pool) => acc + (pool.tvl || 0), 0);

      // Total unique protocols calculation
      // const totalProtocols = new Set(poolsData.map((pool: Pool) => pool.protocol)).size;

      setTotalTVL(totalTVL);
      setTotalTokens(tokensData.length);
      setTotalPools(poolsData.length);
      //setTotalProtocols(totalProtocols); // disabled for now not used
    } catch (error) {
      console.error("Error fetching metrics data:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-8 font-inter">
      <div className="container mx-auto max-w-screen-xl px-8">
        {" "}
        {/* Adjust the max width */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <WalletConnection />
          <Metrics totalTVL={totalTVL} totalTokens={totalTokens} totalPools={totalPools} totalProtocols={3} />
        </div>
        <TableComponent />
      </div>
    </div>
  );
}
