// components/MarketTable.tsx
'use client';

import React from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import { useTheme } from 'next-themes';

interface Pool {
  protocol: string;
  pair: string;
  tvl?: number;
  reserve0?: number;
  reserve1?: number;
  t0usd?: string;
  t1usd?: string;
  lptSupply?: number;
  lpToken?: string;
  pairtype?: string;
  lastUpdated?: string;
}

interface TokenDetails {
  _id: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
}

interface Market {
  marketLabel: string;
  token0: string;
  token1: string;
  token0Details?: TokenDetails;
  token1Details?: TokenDetails;
  pools: Pool[];
  totalTVL?: number;
}

interface MarketTableProps {
  data: Market[];
}

const MarketTable: React.FC<MarketTableProps> = ({ data }) => {
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

  const columns: TableColumn<Market>[] = [
    {
      name: 'Market',
      selector: (row) => row.marketLabel,
      sortable: true,
      cell: (row) => (
        <span className="text-primary font-bold">{row.marketLabel}</span>
      ),
    },
    {
      name: 'Tokens',
      cell: (row) => `${row.token0Details?.symbol} / ${row.token1Details?.symbol}`,
      sortable: true,
    },
    {
      name: 'Pairs Count',
      selector: (row) => row.pools.length,
      sortable: true,
    },
    {
      name: 'Total TVL',
      selector: (row) => row.totalTVL || 0,
      sortable: true,
      cell: (row) => formatCurrency(row.totalTVL),
    },
  ];

  const ExpandedComponent: React.FC<{ data: Market }> = ({ data }) => (
    <div className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white">
      <h3 className="text-lg font-bold mb-2">Pools in {data.marketLabel}</h3>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Protocol</th>
            <th className="text-left">Pair</th>
            <th className="text-left">TVL</th>
            <th className="text-left">Reserve0</th>
            <th className="text-left">Reserve1</th>
          </tr>
        </thead>
        <tbody>
          {data.pools.map((pool, index) => (
            <tr key={index}>
              <td>{pool.protocol}</td>
              <td>{pool.pair}</td>
              <td>{formatCurrency(pool.tvl)}</td>
              <td>{pool.reserve0}</td>
              <td>{pool.reserve1}</td>
            </tr>
          ))}
        </tbody>
      </table>
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

export default MarketTable;
