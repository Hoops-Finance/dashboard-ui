"use client";

import React, { useState } from 'react';
import { ArrowUpDown, Filter, Search, ChevronDown, ChevronUp, ArrowRight } from 'lucide-react';
import { Button, Card, Input } from '../ui';

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

interface TabData {
  markets: MarketData[];
  pools: any[]; // Define a proper interface for pools if needed
  tokens: any[]; // Define a proper interface for tokens if needed
  protocols: any[]; // Define a proper interface for protocols if needed
}

export function TableComponent() {
  const [activeTab, setActiveTab] = useState<keyof TabData>('markets');
  const [expandedRows, setExpandedRows] = useState<number[]>([]);

  const tabData: TabData = {
    markets: [
      { market: 'XLM/USDC', tokens: 'XLM, USDC', pairCount: '3', tvl: '$120M', pools: [
        { protocol: 'Phoenix', pair: 'XLM/USDC', tvl: '$50M' },
        { protocol: 'Aquarius', pair: 'XLM/USDC', tvl: '$40M' },
        { protocol: 'Soroswap', pair: 'XLM/USDC', tvl: '$30M' },
      ]},
      { market: 'XLM/yXLM', tokens: 'XLM, yXLM', pairCount: '2', tvl: '$80M', pools: [
        { protocol: 'Phoenix', pair: 'XLM/yXLM', tvl: '$45M' },
        { protocol: 'Soroswap', pair: 'XLM/yXLM', tvl: '$35M' },
      ]},
      { market: 'USDC/yUSDC', tokens: 'USDC, yUSDC', pairCount: '2', tvl: '$60M', pools: [
        { protocol: 'Aquarius', pair: 'USDC/yUSDC', tvl: '$35M' },
        { protocol: 'Soroswap', pair: 'USDC/yUSDC', tvl: '$25M' },
      ]},
    ],
    pools: [
      { market: 'XLM/USDC', protocol: 'Phoenix', tvl: '$50M', volume: '$15M', fees: '$75K', apr: '6.2%', trendingApr: '6.5%', utilization: '78%', riskScore: 'Low' },
      { market: 'XLM/yXLM', protocol: 'Aquarius', tvl: '$45M', volume: '$10M', fees: '$50K', apr: '5.8%', trendingApr: '6.0%', utilization: '72%', riskScore: 'Medium' },
      { market: 'USDC/yUSDC', protocol: 'Soroswap', tvl: '$35M', volume: '$8M', fees: '$40K', apr: '7.5%', trendingApr: '7.8%', utilization: '85%', riskScore: 'Medium' },
    ],
    tokens: [
      { symbol: 'XLM', name: 'Stellar Lumens', markets: '5', tvl: '$200M' },
      { symbol: 'USDC', name: 'USD Coin', markets: '4', tvl: '$150M' },
      { symbol: 'yXLM', name: 'Yield XLM', markets: '3', tvl: '$80M' },
    ],
    protocols: [
      { rank: 1, name: 'Phoenix', pools: '8', tvl: '$120M' },
      { rank: 2, name: 'Aquarius', pools: '6', tvl: '$100M' },
      { rank: 3, name: 'Soroswap', pools: '5', tvl: '$90M' },
    ],
  };

  const headers: Record<keyof TabData, string[]> = {
    markets: ['Market', 'Tokens', 'Pair Count', 'Total Value Locked'],
    pools: ['Market', 'Protocol', 'TVL', 'Volume', 'Fees', 'APR', 'Trending APR', 'Utilization', 'Risk Score'],
    tokens: ['Token Symbol', 'Name', 'Number of Markets', 'Total Value Locked'],
    protocols: ['Rank', 'Name', 'Number of Pools', 'Total Value Locked'],
  };

  const toggleRowExpansion = (index: number) => {
    setExpandedRows(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <Card className="p-6 text-black">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
          {['Markets', 'Pools', 'Tokens', 'Protocols'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase() as keyof TabData)}
              className={`px-4 py-2 rounded-2xl transition-all duration-300 ${
                activeTab === tab.toLowerCase()
                  ? 'bg-[#e2be08] text-white'
                  : 'text-black hover:bg-gray-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>
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
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              {headers[activeTab].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">
                  {header}
                </th>
              ))}
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tabData[activeTab].map((item: any, index: number) => (
              <React.Fragment key={index}>
                <tr className="transition-all duration-300 hover:bg-gray-100">
                  {Object.entries(item).map(([key, value]: [string, any], i: number) => (
                    key !== 'pools' && (
                      <td key={i} className="px-6 py-4 whitespace-nowrap text-black">{value}</td>
                    )
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap">
                    {activeTab === 'markets' && (
                      <button onClick={() => toggleRowExpansion(index)} className="text-black hover:text-gray-600">
                        {expandedRows.includes(index) ? <ChevronUp /> : <ChevronDown />}
                      </button>
                    )}
                  </td>
                </tr>
                {expandedRows.includes(index) && activeTab === 'markets' && (
                  <tr>
                    <td colSpan={headers[activeTab].length + 1} className="px-6 py-4">
                      <div className="bg-gray-50 p-4 rounded-md text-black">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-semibold">Pools in {(item as MarketData).market}</h4>
                          <Button
                            onClick={() => {/* Add navigation logic here */}}
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
                            <Button className="text-sm text-black">
                              See More
                            </Button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}