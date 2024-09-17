"use client";

import React, { useState } from "react";
import { ArrowUpDown, Filter, Search, ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { Button, Card, Input } from "../ui";
import { useWallet } from "../WalletContext"; // Adjust the import path as necessary

// Define interfaces for different data types
interface Pool {
  protocol: string;
  pair: string;
  tvl: string;
}

interface MarketData {
  market: string;
  tokens: string;
  pairCount: string;
  tvl: string;
  pools: Pool[];
}

interface PoolData {
  market: string;
  protocol: string;
  tvl: string;
  volume: string;
  fees: string;
  apr: string;
  trendingApr: string;
  utilization: string;
  riskScore: string;
}

interface TokenData {
  symbol: string;
  name: string;
  markets: string;
  tvl: string;
}

interface ProtocolData {
  rank: number;
  name: string;
  pools: string;
  tvl: string;
}

interface MyWalletData {
  assetType: string;
  assetCode: string;
  assetIssuer: string;
  balance: string;
}

interface TabData {
  markets: MarketData[];
  pools: PoolData[];
  tokens: TokenData[];
  protocols: ProtocolData[];
}

export function TableComponent() {
  // Define activeTab with explicit type
  const [activeTab, setActiveTab] = useState<"markets" | "pools" | "tokens" | "protocols" | "mywallet">("markets");
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const { otherBalances } = useWallet();

  // Map otherBalances to MyWalletData without checking for "native"
  const myWalletData: MyWalletData[] = otherBalances
    ? otherBalances.map((balance) => {
        if (balance.asset_type === "liquidity_pool_shares") {
          return {
            assetType: "Liquidity Pool Shares",
            assetCode: "N/A",
            assetIssuer: "N/A",
            balance: parseFloat(balance.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          };
        } else {
          // credit_alphanum4 or credit_alphanum12
          return {
            assetType: "Credit",
            assetCode: balance.asset_code,
            assetIssuer: balance.asset_issuer,
            balance: parseFloat(balance.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          };
        }
      })
    : [];

  // Define tabData excluding "mywallet"
  const tabData: TabData = {
    markets: [
      {
        market: "DeFi",
        tokens: "ETH, USDC, DAI",
        pairCount: "150",
        tvl: "$5.2B",
        pools: [
          { protocol: "Uniswap", pair: "ETH/USDC", tvl: "$1.2B" },
          { protocol: "Curve", pair: "DAI/USDC/USDT", tvl: "$800M" },
          { protocol: "Aave", pair: "ETH/DAI", tvl: "$600M" }
        ]
      },
      {
        market: "NFT",
        tokens: "ETH, WETH, APE",
        pairCount: "75",
        tvl: "$1.8B",
        pools: [
          { protocol: "OpenSea", pair: "ETH/WETH", tvl: "$500M" },
          { protocol: "Rarible", pair: "ETH/APE", tvl: "$300M" }
        ]
      },
      {
        market: "GameFi",
        tokens: "AXS, SLP, MANA",
        pairCount: "50",
        tvl: "$800M",
        pools: [
          { protocol: "Axie Infinity", pair: "AXS/SLP", tvl: "$400M" },
          { protocol: "Decentraland", pair: "MANA/ETH", tvl: "$200M" }
        ]
      }
    ],
    pools: [
      { market: "ETH/USDC", protocol: "Uniswap", tvl: "$1.2B", volume: "$450M", fees: "$1.2M", apr: "5.2%", trendingApr: "5.5%", utilization: "75%", riskScore: "Low" },
      { market: "BTC/USDT", protocol: "Curve", tvl: "$800M", volume: "$300M", fees: "$900K", apr: "4.8%", trendingApr: "4.9%", utilization: "68%", riskScore: "Medium" },
      { market: "LINK/ETH", protocol: "SushiSwap", tvl: "$150M", volume: "$75M", fees: "$200K", apr: "6.5%", trendingApr: "6.8%", utilization: "82%", riskScore: "High" }
    ],
    tokens: [
      { symbol: "ETH", name: "Ethereum", markets: "120", tvl: "$10B" },
      { symbol: "USDC", name: "USD Coin", markets: "100", tvl: "$8B" },
      { symbol: "BTC", name: "Bitcoin", markets: "80", tvl: "$6B" }
    ],
    protocols: [
      { rank: 1, name: "Uniswap", pools: "200", tvl: "$5B" },
      { rank: 2, name: "Curve", pools: "150", tvl: "$4B" },
      { rank: 3, name: "SushiSwap", pools: "100", tvl: "$2B" }
    ]
  };

  // Define headers including "mywallet"
  const headers: Record<keyof TabData | "mywallet", string[]> = {
    markets: ["Market", "Tokens", "Pair Count", "Total Value Locked"],
    pools: ["Market", "Protocol", "TVL", "Volume", "Fees", "APR", "Trending APR", "Utilization", "Risk Score"],
    tokens: ["Token Symbol", "Name", "Number of Markets", "Total Value Locked"],
    protocols: ["Rank", "Name", "Number of Pools", "Total Value Locked"],
    mywallet: ["Asset Type", "Asset Code", "Issuer", "Balance"]
  };

  const toggleRowExpansion = (index: number) => {
    setExpandedRows((prev) => (prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]));
  };

  return (
    <Card className="p-6 text-black">
      {/* Tab Buttons */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
          {["Markets", "Pools", "Tokens", "Protocols", "MyWallet"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase() as keyof TabData | "mywallet")}
              className={`px-4 py-2 rounded-2xl transition-all duration-300 ${activeTab === tab.toLowerCase() ? "bg-[#e2be08] text-white" : "text-black hover:bg-gray-200"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input className="pl-10 text-black" placeholder="Search..." />
        </div>
        <div className="flex space-x-2">
          <Button className="border border-gray-300 bg-white text-black hover:bg-gray-50">
            <ArrowUpDown className="inline-block mr-2 h-4 w-4" />
            Sort
          </Button>
          <Button className="border border-gray-300 bg-white text-black hover:bg-gray-50">
            <Filter className="inline-block mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full">
          {/* Table Head */}
          <thead>
            <tr className="bg-gray-50">
              {headers[activeTab].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  {header}
                </th>
              ))}
              {/* Extra header for actions (like expand) if applicable */}
              {activeTab === "markets" && <th className="px-6 py-3"></th>}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Render based on activeTab */}
            {activeTab !== "mywallet" &&
              tabData[activeTab].map((item, index) => (
                <React.Fragment key={index}>
                  <tr className="transition-all duration-300 hover:bg-gray-100">
                    {/* Render table cells */}
                    {Object.entries(item).map(([key, value], i) =>
                      key !== "pools" ? (
                        <td key={i} className="px-6 py-4 whitespace-nowrap text-black">
                          {value}
                        </td>
                      ) : null
                    )}
                    {/* Expand Button for Markets */}
                    {activeTab === "markets" && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button onClick={() => toggleRowExpansion(index)} className="text-black hover:text-gray-600">
                          {expandedRows.includes(index) ? <ChevronUp /> : <ChevronDown />}
                        </button>
                      </td>
                    )}
                  </tr>

                  {/* Expanded Row for Markets */}
                  {expandedRows.includes(index) && activeTab === "markets" && (
                    <tr>
                      <td colSpan={headers[activeTab].length + 1} className="px-6 py-4">
                        <div className="bg-gray-50 p-4 rounded-md text-black">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold">Pools in {(item as MarketData).market}</h4>
                            <Button
                              onClick={() => {
                                /* Add navigation logic here */
                              }}
                              className="text-xs px-3 py-1 bg-black text-white rounded hover:bg-gray-800 flex items-center"
                            >
                              View Market
                              <ArrowRight className="ml-1 h-3 w-3" />
                            </Button>
                          </div>
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead>
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">Protocol</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">Tokens</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-black uppercase tracking-wider">TVL</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(item as MarketData).pools.map((pool, poolIndex) => (
                                <tr key={poolIndex} className="bg-white">
                                  <td className="px-3 py-2 whitespace-nowrap">{pool.protocol}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{pool.pair}</td>
                                  <td className="px-3 py-2 whitespace-nowrap">{pool.tvl}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {(item as MarketData).pools.length > 5 && (
                            <div className="mt-2 text-right">
                              <Button className="text-sm text-black">See More</Button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}

            {/* Render MyWallet Data */}
            {activeTab === "mywallet" &&
              myWalletData.map((item, index) => (
                <tr key={index} className="transition-all duration-300 hover:bg-gray-100">
                  <td className="px-6 py-4 whitespace-nowrap text-black">{item.assetType}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">{item.assetCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">{item.assetIssuer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-black">{item.balance}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default TableComponent;
