"use client";

import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import { useWallet } from "../WalletContext";
import { useTheme } from "../ThemeContext";
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
import { ExplorerTableData, ProcessedToken, MyWalletData, PoolRiskApiResponseObject, Pair, Market } from "utils/newTypes";
import { usePlausible } from "next-plausible";
type TableRow = Market | PoolRiskApiResponseObject | ProcessedToken | MyWalletData | Pair;
function isMarket(row: TableRow): row is Market {
  return (row as Market).token0 !== undefined && (row as Market).token1 !== undefined;
}

function isPair(row: TableRow): row is Pair {
  return (row as Pair).token0 !== undefined && (row as Pair).token1 !== undefined && (row as Pair).lpToken !== undefined;
}

function isPool(row: TableRow): row is PoolRiskApiResponseObject {
  return (row as PoolRiskApiResponseObject).pairId !== undefined && (row as PoolRiskApiResponseObject).market !== undefined;
}

function isToken(row: TableRow): row is ProcessedToken {
  return (row as ProcessedToken).token !== undefined && (row as ProcessedToken).markets !== undefined;
}

function isWalletData(row: TableRow): row is MyWalletData {
  return (row as MyWalletData).assetType !== undefined && (row as MyWalletData).balance !== undefined;
}

interface TableComponentProps {
  explorerData: ExplorerTableData | null;
  processedTokens: ProcessedToken[];
  poolData: PoolRiskApiResponseObject[];
  setPoolData: React.Dispatch<React.SetStateAction<PoolRiskApiResponseObject[]>>;
  loadingPools: boolean;
  setLoadingPools: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectPair: (pairData: Pair, poolRiskData: PoolRiskApiResponseObject) => void;
}

export function TableComponent({ explorerData, processedTokens, poolData, setPoolData, loadingPools, setLoadingPools, onSelectPair }: TableComponentProps) {
  const plausible = usePlausible(); // Initialize Plausible
  const [activeTab, setActiveTab] = useState<"markets" | "pools" | "tokens" | "mywallet">("markets");
  const [showTrackedOnly, setShowTrackedOnly] = useState(false);
  const [showZeroBalances, setShowZeroBalances] = useState(true);
  const [showZeroLiquidity, setShowZeroLiquidity] = useState(false);
  const [poolPeriod, setPoolPeriod] = useState<string>("14d"); // Default period for Pools
  const [filteredWalletData, setFilteredWalletData] = useState<MyWalletData[]>([]);
  const { theme } = useTheme();
  const { otherBalances } = useWallet();

  // Track Tab Change
  const handleTabChange = (tab: string) => {
    setActiveTab(tab.toLowerCase() as "markets" | "pools" | "tokens" | "mywallet");
    plausible("Tab Change", { props: { tab } }); // Send custom event to Plausible
  };

  // Track Filter Changes
  const handleFilterChange = (filterType: string, value: boolean) => {
    plausible("Filter Change", { props: { filterType, value } }); // Send filter change event
  };

  // Track Row Click
  /*
  const handleRowClick = (row: TableRow, tab: string) => {
    let id: string | undefined;
    // Determine the ID based on the row type
    if ("pairId" in row) {
      id = row.pairId;
    } else if ("tokenId" in row) {
      id = row.tokenId;
    }
    plausible("Row Click", { props: { tab, id: row.pairId || row.tokenId } }); // Send row click event with tab and row ID

    const selectedPair = explorerData?.pools.find((pair) => pair.id === row.pairId);
    const selectedPoolRisk = poolData.find((pool) => pool.pairId === row.pairId);
    if (selectedPair && selectedPoolRisk) {
      onSelectPair(selectedPair, selectedPoolRisk);
    }
  };*/
  const handleRowClick = (row: TableRow, tab: string) => {
    if (isMarket(row)) {
      plausible("Market Row Click", { props: { tab, id: row.marketLabel } });
      const selectedPair = explorerData?.pools.find((pair) => pair.id === row.pools[0].id);
      const selectedPoolRisk = poolData.find((pool) => pool.pairId === row.pools[0].id);
      if (selectedPair && selectedPoolRisk) {
        onSelectPair(selectedPair, selectedPoolRisk);
      }
      // Handle Market row click logic here
    } else if (isPair(row)) {
      plausible("Pair Row Click", { props: { tab, id: row.id } });
      const selectedPair = explorerData?.pools.find((pair) => pair.id === row.id);
      const selectedPoolRisk = poolData.find((pool) => pool.pairId === row.id);
      if (selectedPair && selectedPoolRisk) {
        onSelectPair(selectedPair, selectedPoolRisk);
      }
    } else if (isPool(row)) {
      plausible("Pool Row Click", { props: { tab, id: row.pairId } });
      const selectedPair = explorerData?.pools.find((pair) => pair.id === row.pairId);
      const selectedPoolRisk = poolData.find((pool) => pool.pairId === row.pairId);
      if (selectedPair && selectedPoolRisk) {
        onSelectPair(selectedPair, selectedPoolRisk);
      }
    } else if (isToken(row)) {
      plausible("Token Row Click", { props: { tab, id: row.token.id } });
      const selectedPair = explorerData?.pools.find((pair) => pair.id === row.markets[0].pairs[0].id);
      const selectedPoolRisk = poolData.find((pool) => pool.pairId === row.markets[0].pairs[0].id);
      if (selectedPair && selectedPoolRisk) {
        onSelectPair(selectedPair, selectedPoolRisk);
      }
      // Handle Token row click logic here
    } else if (isWalletData(row)) {
      plausible("Wallet Row Click", { props: { tab, id: row.assetCode } });
      // Handle Wallet data row click logic here
    } else {
      plausible("Row Click", { props: { tab, id: "unknown" } });
    }
  };

  // Fetch Pools data when Pools tab is active or poolPeriod changes
  useEffect(() => {
    if (activeTab === "pools") {
      fetchPoolData(setPoolData, setLoadingPools, poolPeriod);
    }
  }, [activeTab, poolPeriod, setPoolData, setLoadingPools]);

  // Update Wallet Data when relevant states change
  useEffect(() => {
    if (explorerData) {
      updateWalletData(otherBalances, showTrackedOnly, showZeroBalances, explorerData, setFilteredWalletData);
    }
  }, [showTrackedOnly, showZeroBalances, otherBalances, explorerData]);

  // Filtered data for Markets based on showZeroLiquidity
  const filteredMarkets = explorerData?.markets.filter((market) => (showZeroLiquidity ? true : market.totalTVL !== 0));

  // Filtered data for Pools based on showZeroLiquidity
  const filteredPools = poolData.filter((pool) => (showZeroLiquidity ? true : parseFloat(pool.totalValueLocked) !== 0));

  // Filtered data for Tokens based on showZeroLiquidity
  const filteredTokens = processedTokens.filter((token) => (showZeroLiquidity ? true : token.totalTVL !== 0));

  if (!explorerData) {
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
            data={filteredTokens} // Updated to use processed tokens
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

      {/* Loading state for pools */}
      {loadingPools && <div>Loading pool data...</div>}
    </div>
  );
}

export default TableComponent;
