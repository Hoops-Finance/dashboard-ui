// components/DataTable.tsx
import React from 'react';
import DataCard from './DataCard';

interface Data {
  pairId: string;
  marketIcon: string;
  market: string;
  protocol: string;
  totalValueLocked: string;
  volume: string;
  fees: string;
  apr: string;
  trendingapr?: string;
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
    return `$${number.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="overflow-x-auto bg-light-bg dark:bg-bg rounded-32px p-6">
      {/* Mobile View */}
      <div className="block lg:hidden p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
          {data.map((row, index) => (
            <DataCard
              key={index}
              marketIcon={row.marketIcon}
              market={row.market}
              protocol={row.protocol}
              totalValueLocked={formatCurrency(row.totalValueLocked)}
              volume={formatCurrency(row.volume)}
              fees={formatCurrency(row.fees)}
              apr={row.apr}
              trendingapr={row.trendingapr ?? ''}
              utilization={row.utilization}
              riskScore={row.riskScore}
            />
          ))}
        </div>
      </div>
      {/* Desktop View */}
      <table className="hidden lg:table min-w-full bg-white dark:bg-gray-800">
        <thead>
          <tr>
            {[
              'Market',
              'Protocol',
              'Total Value Locked',
              'Volume',
              'Fees',
              'APR',
              'Trending APR',
              'Utilization',
              'Risk Score',
            ].map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 border-b-2 border-gray-300 dark:border-gray-700 text-left text-xs leading-4 font-medium text-gray-500 dark:text-gray-200 uppercase tracking-wider cursor-pointer"
                onClick={() => handleSort(header.replace(/ /g, '').toLowerCase() as keyof Data)}
              >
                <div className="flex items-center">
                  {header}
                  {/* Add sort icons if needed */}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={`${
                index % 2 === 0 ? 'bg-white dark:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800'
              } text-sm`}
            >
              {/* Market */}
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center">
                  <img src={row.marketIcon} alt={row.market} className="h-16 w-16 object-contain mr-2" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{row.market}</span>
                </div>
              </td>
              {/* Protocol */}
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-900 dark:text-white">{row.protocol}</span>
              </td>
              {/* Total Value Locked */}
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-900 dark:text-white">
                  {formatCurrency(row.totalValueLocked)}
                </span>
              </td>
              {/* Volume */}
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(row.volume)}</span>
              </td>
              {/* Fees */}
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-900 dark:text-white">{formatCurrency(row.fees)}</span>
              </td>
              {/* APR */}
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-green-500">{row.apr}%</span>
              </td>
              {/* Trending APR */}
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                <span
                  className={`text-sm ${
                    parseFloat(row.trendingapr ?? '') > parseFloat(row.apr) ? 'text-green-500' : 'text-red-500'
                  }`}
                >
                  {row.trendingapr ?? ''}%
                </span>
              </td>
              {/* Utilization */}
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-900 dark:text-white">{row.utilization}%</span>
              </td>
              {/* Risk Score */}
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-900 dark:text-white">{row.riskScore}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
