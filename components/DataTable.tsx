import React from 'react';
import DataCard from './DataCard';

const DataTable: React.FC<{ data: any[] }> = ({ data }) => {
  return (
    <div className="overflow-x-auto bg-gray-200 lg:bg-white rounded-32px p-6">
      <div className="block lg:hidden p-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 justify-items-center">
          {data.map((row, index) => (
            <DataCard
              key={index}
              marketIcon={row.marketIcon}
              market={row.market}
              totalValueLocked={row.totalValueLocked}
              volume24hr={row.volume24hr}
              fees24hr={row.fees24hr}
              apr={row.apr}
              utilization={row.utilization}
              riskScore={row.riskScore}
            />
          ))}
        </div>
      </div>
      <table className="hidden lg:table min-w-full bg-white">
        <thead>
          <tr>
            {['Markets', 'Total Value Locked', 'Volume (24hr)', 'Fees (24hr)', 'APR%', 'Utilization', 'Risk Score'].map((header) => (
              <th key={header} className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center">
                  {header}
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
            <tr key={index} className={`${index % 2 === 0 ? 'bg-custom-gray' : 'bg-white'} rounded-32px`}>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <div className="flex items-center">
                  <img src={row.marketIcon} alt={row.market} className="h-16 w-16 object-contain mr-2" />
                  <span className="text-sm font-medium text-gray-900">{row.market}</span>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className="text-sm text-gray-900">{row.totalValueLocked}</span>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className="text-sm text-gray-900">{row.volume24hr}</span>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className="text-sm text-gray-900">{row.fees24hr}</span>
              </td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">
                <span className="text-sm text-green-500">{row.apr}</span>
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

