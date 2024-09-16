// components/MarketCard.tsx
'use client';

import React, { useState } from 'react';

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

interface MarketCardProps {
  market: Market;
}

const MarketCard: React.FC<MarketCardProps> = ({ market }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="card p-4 mb-4 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">{market.marketLabel}</h3>
          <p>
            {market.token0Details?.symbol} / {market.token1Details?.symbol}
          </p>
          <p>Pairs Count: {market.pools.length}</p>
          <p>Total TVL: {formatCurrency(market.totalTVL)}</p>
        </div>
        <button
          className="text-primary dark:text-nav-accent"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'Show'} Pools
        </button>
      </div>
      {isExpanded && (
        <div className="mt-4">
          {market.pools.map((pool, index) => (
            <div key={index} className="border-t pt-2">
              <p>
                <strong>Protocol:</strong> {pool.protocol}
              </p>
              <p>
                <strong>Pair:</strong> {pool.pair}
              </p>
              <p>
                <strong>TVL:</strong> {formatCurrency(pool.tvl)}
              </p>
              <p>
                <strong>Reserve0:</strong> {pool.reserve0}
              </p>
              <p>
                <strong>Reserve1:</strong> {pool.reserve1}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketCard;
