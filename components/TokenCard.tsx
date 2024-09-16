// components/TokenCard.tsx
'use client';

import React, { useState } from 'react';

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

interface TokenCardProps {
  token: Token;
}

const TokenCard: React.FC<TokenCardProps> = ({ token }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="card p-4 mb-4 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-md">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center mb-2">
            {token.tokenData.logoUrl ? (
              <img src={token.tokenData.logoUrl} alt={token.tokenData.name} className="h-8 w-8 mr-2" />
            ) : (
              <div className="h-8 w-8 mr-2 bg-gray-300 rounded-full"></div>
            )}
            <h3 className="text-lg font-bold">{token.tokenData.symbol}</h3>
          </div>
          <p>{token.tokenData.name}</p>
          <p>Number of Markets: {token.numberOfMarkets}</p>
          <p>Total TVL: {formatCurrency(token.totalTVL)}</p>
        </div>
        <button
          className="text-primary dark:text-nav-accent"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? 'Hide' : 'Show'} Markets
        </button>
      </div>
      {isExpanded && (
        <div className="mt-4">
          {token.markets.map((market, index) => (
            <div key={index} className="mb-4 border-b pb-2">
              <div className="flex justify-between items-center">
                <h4 className="text-md font-bold">Market: {market.counterTokenSymbol}</h4>
                <span>Total TVL: {formatCurrency(market.totalTVL)}</span>
              </div>
              <MarketComponent market={market} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const MarketComponent: React.FC<{ market: Market }> = ({ market }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatCurrency = (value?: number) => {
    if (value === undefined) return '-';
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="mt-2">
      <button
        className="text-primary dark:text-nav-accent mb-2"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? 'Hide' : 'Show'} Pairs
      </button>
      {isExpanded && (
        <div>
          {market.pairs.map((pair, index) => (
            <div key={index} className="border-t pt-2">
              <p>
                <strong>Pair ID:</strong> {pair._id}
              </p>
              <p>
                <strong>Protocol:</strong> {pair.protocol}
              </p>
              <p>
                <strong>TVL:</strong> {formatCurrency(pair.tvl)}
              </p>
              <p>
                <strong>Reserve0:</strong> {pair.reserve0}
              </p>
              <p>
                <strong>Reserve1:</strong> {pair.reserve1}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TokenCard;
