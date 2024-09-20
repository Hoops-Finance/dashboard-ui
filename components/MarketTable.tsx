"use client";

import React, { useState, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useWallet } from "./WalletContext";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/outline";

interface Pool {
  _id: string;
  protocol: string;
  pair: string;
  tvl?: number;
  reserve0?: number;
  reserve1?: number;
}

interface TokenDetails {
  _id: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
}

interface Market {
  marketLabel: string;
  token0: string;
  token1: string;
  token0Details?: TokenDetails;
  token1Details?: TokenDetails;
  pools: Pool[];
  totalTVL?: number;
}

interface MyWalletData {
  assetType: string;
  assetCode: string;
  assetIssuer: string;
  balance: string;
}

interface TabData {
  markets: Market[];
  pools: Pool[];
  tokens: TokenDetails[];
}

export function TableComponent() {
  const [activeTab, setActiveTab] = useState<"markets" | "pools" | "tokens" | "mywallet">("markets");
  const [tabData, setTabData] = useState<TabData | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { otherBalances } = useWallet();
  const [loading, setLoading] = useState(true);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Check on initial load
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Detect dark mode by checking document class list
  useEffect(() => {
    const checkTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };
    checkTheme(); // Check on initial load
    window.addEventListener("themechange", checkTheme); // Assuming you have an event that triggers when the theme changes
    return () => window.removeEventListener("themechange", checkTheme);
  }, []);

  const myWalletData = otherBalances
    ? otherBalances.map((balance) => {
        if (balance.asset_type === "liquidity_pool_shares") {
          return {
            assetType: "Liquidity Pool Shares",
            assetCode: "N/A",
            assetIssuer: balance.liquidity_pool_id,
            balance: parseFloat(balance.balance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          };
        } else {
          return {
            assetType: balance.asset_type,
            assetCode: balance.asset_code,
            assetIssuer: balance.asset_issuer,
            balance: parseFloat(balance.balance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            })
          };
        }
      })
    : [];

  // Fetch markets, pools, and tokens data from the API
  const fetchData = async () => {
    setLoading(true);
    try {
      const marketsResponse = await fetch("https://api.v1.xlm.services/markets");
      const marketsData: Market[] = await marketsResponse.json();

      const poolsResponse = await fetch("https://api.v1.xlm.services/pairs");
      const poolsData: Pool[] = await poolsResponse.json();

      const tokensResponse = await fetch("https://api.v1.xlm.services/tokens");
      const tokensData: TokenDetails[] = await tokensResponse.json();

      setTabData({ markets: marketsData, tokens: tokensData, pools: poolsData });
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const customStyles = {
    header: {
      style: {
        backgroundColor: isDarkMode ? "#2b2b2b" : "#ffffff",
        color: isDarkMode ? "#B7A7E5" : "#000000"
      }
    },
    headRow: {
      style: {
        backgroundColor: isDarkMode ? "#2b2b2b" : "#f0f0f0"
      }
    },
    rows: {
      style: {
        backgroundColor: isDarkMode ? "#1b1b1b" : "#ffffff",
        color: isDarkMode ? "#ffffff" : "#000000"
      }
    },
    pagination: {
      style: {
        backgroundColor: isDarkMode ? "#2b2b2b" : "#ffffff",
        color: isDarkMode ? "#B7A7E5" : "#000000"
      }
    }
  };

  // Define columns for DataTable
  const marketColumns: TableColumn<Market>[] = [
    {
      name: "Market",
      selector: (row) => row.marketLabel,
      sortable: true,
      cell: (row) => <span className="text-primary font-bold">{row.marketLabel}</span>
    },
    {
      name: "Tokens",
      cell: (row) => `${row.token0Details?.symbol} / ${row.token1Details?.symbol}`,
      sortable: true
    },
    {
      name: "Pairs Count",
      selector: (row) => row.pools.length,
      sortable: true
    },
    {
      name: "Total TVL",
      selector: (row) => row.totalTVL || 0,
      sortable: true,
      cell: (row) => (row.totalTVL ? `$${row.totalTVL.toLocaleString()}` : "-")
    }
  ];

  const poolColumns: TableColumn<Pool>[] = [
    {
      name: "Protocol",
      selector: (row) => row.protocol,
      sortable: true
    },
    {
      name: "Pair",
      selector: (row) => row.pair,
      sortable: true
    },
    {
      name: "TVL",
      selector: (row) => row.tvl || 0,
      sortable: true,
      cell: (row) => (row.tvl ? `$${row.tvl.toLocaleString()}` : "-")
    }
  ];

  const tokenColumns: TableColumn<TokenDetails>[] = [
    {
      name: "Token Symbol",
      selector: (row) => row.symbol,
      sortable: true
    },
    {
      name: "Name",
      selector: (row) => row.name,
      sortable: true
    },
    {
      name: "Price",
      selector: (row) => row.price,
      sortable: true,
      cell: (row) => `$${row.price.toLocaleString()}`
    }
  ];

  // Render Market Card for mobile view
  const renderMarketCard = (market: Market) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
      <div className="card p-4 mb-4 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold">{market.marketLabel}</h3>
            <p>
              {market.token0Details?.symbol} / {market.token1Details?.symbol}
            </p>
            <p>Pairs Count: {market.pools.length}</p>
            <p>Total TVL: {market.totalTVL ? `$${market.totalTVL.toLocaleString()}` : "-"}</p>
          </div>
          <button className="text-primary dark:text-nav-accent" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Hide" : "Show"} Pools
          </button>
        </div>
        {isExpanded && (
          <div className="mt-4">
            {market.pools.map((pool, index) => (
              <div key={index} className="border-t pt-2">
                <p>
                  <strong>Protocol:</strong> {pool.protocol}
                </p>
                <p>
                  <strong>Pair:</strong> {pool.pair}
                </p>
                <p>
                  <strong>TVL:</strong> {pool.tvl ? `$${pool.tvl.toLocaleString()}` : "-"}
                </p>
                <p>
                  <strong>Reserve0:</strong> {pool.reserve0}
                </p>
                <p>
                  <strong>Reserve1:</strong> {pool.reserve1}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="card-base">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-2xl">
          {["Markets", "Pools", "Tokens", "MyWallet"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase() as keyof TabData | "mywallet")}
              className={`px-4 py-2 rounded-2xl transition-all duration-300 ${
                activeTab === tab.toLowerCase() ? "bg-[#e2be08] text-white" : "text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        {activeTab === "markets" &&
          (isMobile ? (
            tabData?.markets.map((market, index) => renderMarketCard(market))
          ) : (
            <DataTable columns={marketColumns} data={tabData?.markets || []} expandableRows pagination customStyles={customStyles} />
          ))}

        {activeTab === "pools" && <DataTable columns={poolColumns} data={tabData?.pools || []} expandableRows pagination customStyles={customStyles} />}

        {activeTab === "tokens" && <DataTable columns={tokenColumns} data={tabData?.tokens || []} pagination customStyles={customStyles} />}

        {activeTab === "mywallet" && (
          <div>
            {myWalletData.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-700">
                    <th className="table-header-cell">Asset Type</th>
                    <th className="table-header-cell">Asset Code</th>
                    <th className="table-header-cell">Issuer</th>
                    <th className="table-header-cell">Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {myWalletData.map((item, index) => (
                    <tr key={index} className="table-row-hover">
                      <td className="table-cell-base text-primary">{item.assetType}</td>
                      <td className="table-cell-base text-primary">{item.assetCode}</td>
                      <td className="table-cell-base text-primary">{item.assetIssuer}</td>
                      <td className="table-cell-base text-primary">{item.balance}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No assets found in your wallet.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default TableComponent;
