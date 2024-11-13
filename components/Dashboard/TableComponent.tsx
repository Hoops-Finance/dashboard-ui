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
import { ExpandedTokenComponent } from "../DataViews/ExpandedTokens";
import { customTableStyles } from "../DataViews/TableStyles";
import { ExplorerTableData, ProcessedToken, MyWalletData, PoolRiskApiResponseObject, Pair, Market } from "utils/newTypes";
import { usePlausible } from "next-plausible";
type TableRow = Market | PoolRiskApiResponseObject | ProcessedToken | MyWalletData | Pair;

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

  const handleRowClick = (row: TableRow, tab: string) => {
    switch (tab) {
      case "markets": {
        const marketRow = row as Market;
        if (marketRow.pools.length > 0) {
          plausible("Markets Click", {
            props: { tab, id: (row as Market).marketLabel }
          });

          const selectedPair = explorerData?.pools.find((pair) => pair.id === marketRow.pools[0].id);
          const selectedPoolRisk = poolData.find((pool) => pool.pairId === marketRow.pools[0].id);
          if (selectedPair && selectedPoolRisk) {
            onSelectPair(selectedPair, selectedPoolRisk);
          }
        }
        break;
      }

      case "pairs": {
        const pairRow = row as Pair;
        plausible("Pairs Click", { props: { tab, id: (row as Pair).id } });

        const selectedPair = explorerData?.pools.find((pair) => pair.id === pairRow.id);
        const selectedPoolRisk = poolData.find((pool) => pool.pairId === pairRow.id);
        if (selectedPair && selectedPoolRisk) {
          onSelectPair(selectedPair, selectedPoolRisk);
        }
        break;
      }

      case "pools": {
        plausible("pools Click", {
          props: { tab, id: (row as PoolRiskApiResponseObject).pairId }
        });

        const poolRow = row as PoolRiskApiResponseObject;
        const selectedPair = explorerData?.pools.find((pair) => pair.id === poolRow.pairId);
        const selectedPoolRisk = poolData.find((pool) => pool.pairId === poolRow.pairId);
        if (selectedPair && selectedPoolRisk) {
          onSelectPair(selectedPair, selectedPoolRisk);
        }
        break;
      }

      case "tokens": {
        const tokenRow = row as ProcessedToken;
        plausible("tokens Click", {
          props: { tab, id: (row as ProcessedToken).token.name }
        });

        if (tokenRow.markets.length > 0 && tokenRow.markets[0].pairs.length > 0) {
          const selectedPair = explorerData?.pools.find((pair) => pair.id === tokenRow.markets[0].pairs[0].id);
          const selectedPoolRisk = poolData.find((pool) => pool.pairId === tokenRow.markets[0].pairs[0].id);
          if (selectedPair && selectedPoolRisk) {
            onSelectPair(selectedPair, selectedPoolRisk);
          }
        }
        break;
      }

      case "mywallet": {
        const walletRow = row as MyWalletData;
        console.log(`Wallet Asset Code: ${walletRow.assetCode}`);
        // Handle Wallet data row click logic here
        break;
      }

      default:
        console.warn("Unknown tab or row type");
        break;
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
    <div className="card-base">
      <div className="flex justify-between items-center mb-4">
        {/* Tabs */}
        <div className="tab-container">
          {["Markets", "Pools", "Tokens" /*, "MyWallet"*/].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)} // Track tab change
              className={`tab-button ${activeTab === tab.toLowerCase() ? "tab-button-active" : "tab-button-inactive"}`}
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
            highlightOnHover
            pointerOnHover
            expandOnRowClicked
            expandableRowsHideExpander
            expandableRowsComponent={(props) => (
              <ExpandedMarketComponent
                {...props}
                handleRowClick={handleRowClick} // Pass handleRowClick as a prop
              />
            )}
            selectableRowsHighlight
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
            highlightOnHover
            pointerOnHover
            selectableRowsHighlight
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
            expandOnRowClicked
            highlightOnHover
            pointerOnHover
            expandableRowsComponent={(props) => (
              <ExpandedTokenComponent
                {...props}
                handleRowClick={handleRowClick} // Pass handleRowClick as a prop
              />
            )}
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
