import React from 'react';

interface TokenData {
  tokenName: string;
  tokenSymbol: string;
  totalValueLocked: string;
}

interface TokenTableProps {
  data: TokenData[];
}

const TokenTable: React.FC<TokenTableProps> = ({ data }) => {
  return (
    <div className="overflow-x-auto bg-gray-200 lg:bg-white rounded-32px p-6">
      <table className="min-w-full bg-white">
        <thead>
          <tr>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Token Name</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Symbol</th>
            <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider">Total Value Locked</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index} className={`${index % 2 === 0 ? 'bg-custom-gray' : 'bg-white'} rounded-32px text-sm`}>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{row.tokenName}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{row.tokenSymbol}</td>
              <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-200">{row.totalValueLocked}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TokenTable;
