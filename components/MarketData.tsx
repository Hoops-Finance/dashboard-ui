import React, { useState } from "react";
import { ArrowsUpDownIcon, InformationCircleIcon, ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";
interface MarketDataProps {
  marketData: {
    marketCap: number;
    volume24h: number;
    totalPairs: number;
    xlmPrice: number;
    usdcPrice: number;
    marketDominance: number;
    pairs: PairData[];
    lastUpdated: string;
  };
}

interface PairData {
  ranking: number;
  protocol: string;
  pair: string;
  tvl: number;
  volume: number;
  apy: number;
  [key: string]: number | string;
}

const MarketInfo: React.FC<MarketDataProps> = ({ marketData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [sortColumn, setSortColumn] = useState<string>("ranking");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
  };

  const formatPercentage = (num: number): string => {
    return new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 2 }).format(num / 100);
  };

  const sortPairs = (pairs: PairData[]): PairData[] => {
    return [...pairs].sort((a, b) => {
      if (a[sortColumn] < b[sortColumn]) return sortDirection === "asc" ? -1 : 1;
      if (a[sortColumn] > b[sortColumn]) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (column: string): void => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">XLM/USDC Market</h2>
          <div className="flex space-x-2">
            {["Trade", "Add Liquidity", "Remove Liquidity"].map((action) => (
              <button key={action} className="bg-[#FFB734] hover:bg-[#E6A52F] text-black px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200">
                {action}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <InfoCard title="Market Cap" value={formatCurrency(marketData.marketCap)} />
          <InfoCard title="24h Volume" value={formatCurrency(marketData.volume24h)} />
          <InfoCard title="Total Pairs" value={marketData.totalPairs} />
          <InfoCard title="XLM Price" value={formatCurrency(marketData.xlmPrice)} />
          <InfoCard title="USDC Price" value={formatCurrency(marketData.usdcPrice)} />
          <InfoCard title="Market Dominance" value={formatPercentage(marketData.marketDominance)} />
        </div>

        <div className="mt-6">
          <button className="flex items-center text-[#FFB734] hover:text-[#E6A52F] transition-colors duration-200" onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Hide" : "Show"} Market Pairs
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {["Ranking", "Protocol", "Pair", "TVL", "Volume", "APY"].map((header) => (
                    <th
                      key={header}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => handleSort(header.toLowerCase())}
                    >
                      <div className="flex items-center">
                        {header}
                        {sortColumn === header.toLowerCase() && (sortDirection === "asc" ? <ArrowUpIcon className="ml-1 h-4 w-4" /> : <ArrowDownIcon className="ml-1 h-4 w-4" />)}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortPairs(marketData.pairs).map((pair) => (
                  <tr key={pair.ranking}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pair.ranking}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pair.protocol}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pair.pair}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(pair.tvl)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(pair.volume)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatPercentage(pair.apy)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 flex items-center text-sm text-gray-500">
          <InformationCircleIcon className="h-4 w-4 mr-2" />
          Last updated: {new Date(marketData.lastUpdated).toLocaleString()}
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  title: string;
  value: string | number;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <p className="text-xl font-bold text-gray-800">{value}</p>
  </div>
);

export default MarketInfo;
