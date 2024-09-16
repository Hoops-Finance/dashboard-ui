"use client";

import { useState } from 'react';
import { ArrowUpDown, Filter, Search } from 'lucide-react';
import { Button, Card, Input } from '../ui';

export function TableComponent() {
  const [activeTab, setActiveTab] = useState('pools');

  const poolsData = [
    { market: 'ETH/USDC', protocol: 'Uniswap', tvl: '$1.2B', volume: '$450M', fees: '$1.2M', apr: '5.2%', trendingApr: '5.5%', utilization: '75%', riskScore: 'Low' },
    { market: 'BTC/USDT', protocol: 'Curve', tvl: '$800M', volume: '$300M', fees: '$900K', apr: '4.8%', trendingApr: '4.9%', utilization: '68%', riskScore: 'Medium' },
    { market: 'LINK/ETH', protocol: 'SushiSwap', tvl: '$150M', volume: '$75M', fees: '$200K', apr: '6.5%', trendingApr: '6.8%', utilization: '82%', riskScore: 'High' },
  ];

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-2xl">
          {['Markets', 'Pools', 'Tokens', 'Protocols'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase())}
              className={`px-4 py-2 rounded-2xl transition-all duration-300 ${
                activeTab === tab.toLowerCase()
                  ? 'bg-[#e2be08] text-white'
                  : 'text-gray-600 hover:bg-gray-200'
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
          <Input className="pl-10" placeholder="Search..." />
        </div>
        <div className="flex space-x-2">
          <Button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            <ArrowUpDown className="inline-block mr-2 h-4 w-4" />
            Sort
          </Button>
          <Button className="border border-gray-300 bg-white text-gray-700 hover:bg-gray-50">
            <Filter className="inline-block mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gray-50">
              {['Market', 'Protocol', 'Total Value Locked', 'Volume', 'Fees', 'APR', 'Trending APR', 'Utilization', 'Risk Score'].map((header) => (
                <th key={header} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {poolsData.map((pool, index) => (
              <tr key={index} className="transition-all duration-300 hover:bg-gray-100">
                <td className="px-6 py-4 whitespace-nowrap">{pool.market}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pool.protocol}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pool.tvl}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pool.volume}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pool.fees}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pool.apr}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pool.trendingApr}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pool.utilization}</td>
                <td className="px-6 py-4 whitespace-nowrap">{pool.riskScore}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}