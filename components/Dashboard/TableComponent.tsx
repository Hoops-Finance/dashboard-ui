"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { useWallet } from "../WalletContext";
import { useTheme } from "../ThemeContext";
import { fetchData } from "../../utils/FetchData";
import { fetchTokenData } from "../../utils/FetchTokenData";
import { fetchPoolData } from "../../utils/FetchPoolData";
import { updateWalletData } from "../../utils/UpdateWalletData";
import { FilterOptionsPopover } from "./FilterOptionsPopover";
import { marketColumns } from "../DataViews/MarketColumns";
import { walletColumns } from "../DataViews/WalletColumns";
import { tokenColumns } from "../DataViews/TokenColumns";
import { poolsColumns } from "../DataViews/PoolsColumns";
import { ExpandedMarketComponent } from "../DataViews/ExpandedMarkets";
import { ExpandedTokenComponent } from "../DataViews/ExpandedTokenComponent";
import { customTableStyles } from "../DataViews/TableStyles";
import { TabData, MyWalletData, PoolData, TokenToken } from "../../utils/types";
import { usePlausible } from "next-plausible";

export function TableComponent() {
  const plausible = usePlausible(); // Initialize Plausible
  const [activeTab, setActiveTab] = useState<"markets" | "pools" | "tokens" | "mywallet">("markets");
  const [tabData, setTabData] = useState<TabData | null>(null);
  const [tokens, setTokens] = useState<TokenToken[]>([]); // State for tokens
  const [poolData, setPoolData] = useState<PoolData[]>([]); // Pool data state
  const [loading, setLoading] = useState(true);
  const [loadingPools, setLoadingPools] = useState(false); // Pool loading state
  const [showTrackedOnly, setShowTrackedOnly] = useState(false);
  const [showZeroBalances, setShowZeroBalances] = useState(true);
  const [showZeroLiquidity, setShowZeroLiquidity] = useState(false);
  const [poolPeriod, setPoolPeriod] = useState<string>("14d"); // Default period for Pools
  const [filteredWalletData, setFilteredWalletData] = useState<MyWalletData[]>([]);
  const { theme } = useTheme();
  const { otherBalances } = useWallet();

  // Track Tab Change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab.toLowerCase() as keyof TabData | "mywallet");
    plausible("Tab Change", { props: { tab } }); // Send custom event to Plausible
  };

  // Track Filter Changes
  const handleFilterChange = (filterType: string, value: boolean) => {
    plausible("Filter Change", { props: { filterType, value } }); // Send filter change event
  };

  // Track Row Click
  const handleRowClick = (row: any, tab: string) => {
    plausible("Row Click", { props: { tab, id: row.pairId || row.tokenId } }); // Send row click event with tab and row ID
  };

  // Fetch Markets and Tokens data
  useEffect(() => {
    fetchData(setTabData, setLoading);
    fetchTokenData(setTokens, setLoading); // Fetch token data separately
  }, []);

  // Update Wallet Data when relevant states change
  useEffect(() => {
    if (tabData) {
      updateWalletData(otherBalances, showTrackedOnly, showZeroBalances, tabData, setFilteredWalletData);
    }
  }, [showTrackedOnly, showZeroBalances, otherBalances, tabData]);

  // Fetch Pools data when Pools tab is active or poolPeriod changes
  useEffect(() => {
    if (activeTab === "pools") {
      fetchPoolData(setPoolData, setLoadingPools, poolPeriod);
    }
  }, [activeTab, poolPeriod]);

  // Filtered data for Markets based on showZeroLiquidity
  const filteredMarkets = tabData?.markets.filter((market) => (showZeroLiquidity ? true : parseFloat(market.totalTVL?.toString() || "0") !== 0));

  // Filtered data for Pools based on showZeroLiquidity
  const filteredPools = poolData.filter((pool) => (showZeroLiquidity ? true : parseFloat(pool.totalValueLocked) !== 0));

  if (loading || (activeTab === "pools" && loadingPools)) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`card-base ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
      <div className="flex justify-between items-center mb-4">
        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl">
          {["Markets", "Pools", "Tokens", "MyWallet"].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)} // Track tab change
              className={`px-4 py-2 rounded-2xl transition-all duration-300 ${
                activeTab === tab.toLowerCase() ? "bg-[#E2BE08] text-black" : "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Filter Options */}
        <FilterOptionsPopover
          showTrackedOnly={showTrackedOnly}
          showZeroBalances={showZeroBalances}
          showZeroLiquidity={showZeroLiquidity}
          setShowTrackedOnly={(value) => {
            setShowTrackedOnly(value);
            handleFilterChange("Tracked Only", value); // Track filter change
          }}
          setShowZeroBalances={(value) => {
            setShowZeroBalances(value);
            handleFilterChange("Show Zero Balances", value); // Track filter change
          }}
          setShowZeroLiquidity={(value) => {
            setShowZeroLiquidity(value);
            handleFilterChange("Show Zero Liquidity", value); // Track filter change
          }}
          activeTab={activeTab}
          poolPeriod={activeTab === "pools" ? poolPeriod : undefined}
          setPoolPeriod={activeTab === "pools" ? setPoolPeriod : undefined}
        />
      </div>

      <div className="overflow-x-auto">
        {/* Markets Tab */}
        {activeTab === "markets" && (
          <DataTable
            columns={marketColumns}
            data={filteredMarkets || []}
            expandableRows
            expandableRowsComponent={ExpandedMarketComponent}
            pagination
            paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
            customStyles={customTableStyles(theme)}
            onRowClicked={(row) => handleRowClick(row, "markets")} // Track row click
          />
        )}

        {/* Pools Tab */}
        {activeTab === "pools" && (
          <DataTable
            columns={poolsColumns}
            data={filteredPools}
            pagination
            paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
            customStyles={customTableStyles(theme)}
            onRowClicked={(row) => handleRowClick(row, "pools")} // Track row click
          />
        )}

        {/* Tokens Tab */}
        {activeTab === "tokens" && (
          <DataTable
            columns={tokenColumns}
            data={tokens || []}
            expandableRows
            expandableRowsComponent={ExpandedTokenComponent}
            pagination
            paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
            customStyles={customTableStyles(theme)}
            onRowClicked={(row) => handleRowClick(row, "tokens")} // Track row click
          />
        )}

        {/* MyWallet Tab */}
        {activeTab === "mywallet" && (
          <DataTable
            columns={walletColumns}
            data={filteredWalletData}
            pagination
            paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
            customStyles={customTableStyles(theme)}
            onRowClicked={(row) => handleRowClick(row, "mywallet")} // Track row click
          />
        )}
      </div>
    </div>
  );
}

export default TableComponent;
