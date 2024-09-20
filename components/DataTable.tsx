import React from "react";
import Image from "next/image";
import DataCard from "./DataCard";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

interface Data {
  pairId: string;
  marketIcon: string;
  market: string;
  totalValueLocked: string;
  volume: string;
  fees: string;
  trendingapr?: string;
  apr: string;
  utilization: string;
  riskScore: string;
  rankingScore: string;
}

interface DataTableProps {
  data: Data[];
  handleSort: (key: keyof Data) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, handleSort }) => {
  const formatCurrency = (value: string) => {
    const number = parseFloat(value);
    return number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  return (
    <div className="overflow-x-auto bg-gray-200 dark:bg-gray-900 rounded-2xl p-6">
      {/* Mobile View */}
      <div className="block lg:hidden p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
          {data.map((row, index) => (
            <DataCard
              key={index}
              marketIcon={row.marketIcon}
              market={row.market}
              totalValueLocked={formatCurrency(row.totalValueLocked)}
              volume={formatCurrency(row.volume)}
              fees={formatCurrency(row.fees)}
              apr={row.apr}
              trendingapr={row.trendingapr ?? ""}
              utilization={row.utilization}
              riskScore={row.riskScore}
            />
          ))}
        </div>
      </div>

      {/* Desktop View */}
      <table className="hidden lg:table min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr className="bg-gray-50 dark:bg-gray-700">
            {["Market", "Total Value Locked", "Volume", "Fees", "APR", "Trending APR", "Utilization", "Risk Score"].map((header) => (
              <th
                key={header}
                className="px-6 py-3 border-b-2 border-gray-300 dark:border-gray-600 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort(header.toLowerCase().replace(" ", "") as keyof Data)}
              >
                <div className="flex items-center">
                  {header}
                  <span className="ml-2">
                    {/* Replace with dynamic sort icons if needed */}
                    <ChevronDownIcon className="h-4 w-4 text-gray-400 dark:text-gray-300" />
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          {data.map((row, index) => (
            <tr key={index} className="transition-all duration-300 hover:bg-gray-100 dark:hover:bg-gray-700">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                <div className="flex items-center">
                  <Image src={row.marketIcon} alt={row.market} width={64} height={64} className="h-16 w-16 object-contain mr-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{row.market}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{formatCurrency(row.totalValueLocked)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{formatCurrency(row.volume)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{formatCurrency(row.fees)}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-green-500 dark:text-green-400">{row.apr}</td>
              <td
                className={`px-6 py-4 whitespace-nowrap text-sm ${parseFloat(row.trendingapr ?? "") > parseFloat(row.apr) ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}`}
              >
                {row.trendingapr ?? ""}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{row.utilization}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">{row.riskScore}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
