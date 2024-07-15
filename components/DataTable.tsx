import React from 'react';
import DataCard from './DataCard';

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
    <div className="overflow-x-auto bg-gray-200 lg:bg-white rounded-32px p-6">
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
              trendingapr={row.trendingapr ?? ''}
              utilization={row.utilization}
              riskScore={row.riskScore}
            />
          ))}
        </div>
      </div>
      <table className="hidden lg:table min-w-full bg-white">
        <thead>
          <tr>
            {['market', 'totalValueLocked', 'volume', 'fees', 'apr', 'trendingapr', 'utilization', 'riskScore'].map((header) => (
              <th
                key={header}
                className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider"
                onClick={() => handleSort(header as keyof Data)}
              >
                <div className="flex items-center cursor-pointer">
                  {header.replace(/([A-Z])/g, ' $1').trim()}
                  <svg className="ml-2 h-4 w-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707A1 1 0 016.293 6.293l3-3A1 1 0 0110 3zM10 17a1 1 0 01-.707-.293l-3-3a1 1 0 011.414-1.414L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3A1 1 0 0110 17z" />
                  </svg>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className={`${index % 2 === 0 ? 'bg-custom-gray' : 'bg-white'} rounded-32px text-sm`}>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <div className="flex items-center">
                  <img src={row.marketIcon} alt={row.market} className="h-16 w-16 object-contain mr-2" />
                  <span className="text-sm font-medium text-gray-900">{row.market}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className="text-sm text-gray-900">{formatCurrency(row.totalValueLocked)}</span>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className="text-sm text-gray-900">{formatCurrency(row.volume)}</span>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className="text-sm text-gray-900">{formatCurrency(row.fees)}</span>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className="text-sm text-green-500">{row.apr}</span>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className={`${parseFloat(row.trendingapr ?? '') > parseFloat(row.apr) ? 'text-green-500' : 'text-red-500'}`}>{row.trendingapr ?? ''}</span>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className="text-sm text-gray-900">{row.utilization}</span>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className="text-sm text-gray-900">{row.riskScore}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
