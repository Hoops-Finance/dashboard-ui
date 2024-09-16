// components/TokenTable.tsx
'use client';

import React from 'react';
import DataTable, { TableColumn, ExpanderComponentProps } from 'react-data-table-component';
import { useTheme } from 'next-themes';

interface Pair {
  _id: string;
  token0: string;
  token1: string;
  lpToken: string;
  reserve0: number;
  reserve1: number;
  t0usd: string;
  t1usd: string;
  lptSupply: number;
  lpHolders: string[];
  protocol: string;
  pairtype: string;
  tvl: number;
  lastUpdated: string;
}

interface TokenData {
  _id: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  issuer: string;
  logoUrl?: string;
}

interface Market {
  counterTokenSymbol: string;
  counterTokenDetails: TokenData;
  pairs: Pair[];
  totalTVL: number;
}

interface Token {
  tokenData: TokenData;
  markets: Market[];
  numberOfMarkets: number;
  totalTVL: number;
}

interface TokenTableProps {
  data: Token[];
}

const TokenTable: React.FC<TokenTableProps> = ({ data }) => {
  const { theme } = useTheme();

  const isDarkMode = theme === 'dark';

  const customStyles = {
    header: {
      style: {
        backgroundColor: isDarkMode ? '#2b2b2b' : '#ffffff',
        color: isDarkMode ? '#B7A7E5' : '#000000',
      },
    },
    headRow: {
      style: {
        backgroundColor: isDarkMode ? '#2b2b2b' : '#f0f0f0',
      },
    },
    rows: {
      style: {
        backgroundColor: isDarkMode ? '#1b1b1b' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
      },
    },
    expanderRow: {
      style: {
        backgroundColor: isDarkMode ? '#1b1b1b' : '#ffffff',
      },
    },
    pagination: {
      style: {
        backgroundColor: isDarkMode ? '#2b2b2b' : '#ffffff',
        color: isDarkMode ? '#B7A7E5' : '#000000',
      },
    },
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const columns: TableColumn<Token>[] = [
    {
      name: 'Token',
      selector: (row) => row.tokenData.symbol,
      sortable: true,
      cell: (row) => (
        <div className="flex items-center">
          {row.tokenData.logoUrl ? (
            <img src={row.tokenData.logoUrl} alt={row.tokenData.name} className="h-8 w-8 mr-2" />
          ) : (
            <div className="h-8 w-8 mr-2 bg-gray-300 rounded-full"></div>
          )}
          <span className="text-primary font-bold">{row.tokenData.symbol}</span>
        </div>
      ),
    },
    {
      name: 'Name',
      selector: (row) => row.tokenData.name,
      sortable: true,
    },
    {
      name: 'Number of Markets',
      selector: (row) => row.numberOfMarkets,
      sortable: true,
    },
    {
      name: 'Total TVL',
      selector: (row) => row.totalTVL,
      sortable: true,
      cell: (row) => formatCurrency(row.totalTVL),
    },
  ];

  const ExpandedMarketComponent: React.FC<{ data: Market }> = ({ data }) => (
    <div className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white">
      <h4 className="text-md font-bold mb-2">Pairs with {data.counterTokenSymbol}</h4>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Pair ID</th>
            <th className="text-left">Protocol</th>
            <th className="text-left">TVL</th>
            <th className="text-left">Reserve0</th>
            <th className="text-left">Reserve1</th>
          </tr>
        </thead>
        <tbody>
          {data.pairs.map((pair, index) => (
            <tr key={index}>
              <td>{pair._id}</td>
              <td>{pair.protocol}</td>
              <td>{formatCurrency(pair.tvl)}</td>
              <td>{pair.reserve0}</td>
              <td>{pair.reserve1}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const ExpandedComponent: React.FC<ExpanderComponentProps<Token>> = ({ data }) => (
    <div className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white">
      {data.markets.map((market, index) => (
        <div key={index} className="mb-4 border-b pb-2">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold">Market: {market.counterTokenSymbol}</h3>
            <span>Total TVL: {formatCurrency(market.totalTVL)}</span>
          </div>
          <ExpandedMarketComponent data={market} />
        </div>
      ))}
    </div>
  );

  return (
    <DataTable
      columns={columns}
      data={data}
      expandableRows
      expandableRowsComponent={ExpandedComponent}
      pagination
      customStyles={customStyles}
    />
  );
};

export default TokenTable;
