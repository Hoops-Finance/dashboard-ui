'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';

interface Pair {
  _id: string;
  token0: string;
  token1: string;
  lpToken?: string;
  reserve0: number;
  reserve1: number;
  t0usd?: string;
  t1usd?: string;
  lptSupply: number;
  protocol: string;
  pairtype: string;
  tvl: number;
}

interface Market {
  marketName: string;
  pairs: Pair[];
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPairsData();
  }, []);

  const fetchPairsData = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://api.v1.xlm.services/pairs'); // Fetch directly from API
      const pairsData: Pair[] = await response.json();

      const groupedMarkets = groupPairsIntoMarkets(pairsData);
      setMarkets(groupedMarkets);
    } catch (error) {
      console.error('Error fetching pairs data:', error);
    } finally {
      setLoading(false);
    }
  };

  const groupPairsIntoMarkets = (pairs: Pair[]): Market[] => {
    const marketsMap: Record<string, Pair[]> = {};

    // Loop through all pairs and group them by market name (token0/token1 pair)
    pairs.forEach((pair) => {
      const marketName = `${pair.token0}/${pair.token1}`;

      if (!marketsMap[marketName]) {
        marketsMap[marketName] = [];
      }
      marketsMap[marketName].push(pair);
    });

    // Convert the market map to an array of Market objects
    const markets = Object.keys(marketsMap).map((marketName) => ({
      marketName,
      pairs: marketsMap[marketName],
    }));

    return markets;
  };

  return (
    <div>
      <Navbar />
      <h1>Markets</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="w-full max-w-screen-lg">
          {markets.length > 0 ? (
            markets.map((market) => (
              <li key={market.marketName} className="mb-4">
                <h2 className="text-lg font-bold">{market.marketName}</h2>
                <ul className="ml-4">
                  {/* List all pairs within this market */}
                  {market.pairs.map((pair) => (
                    <li key={pair._id}>
                      {pair.token0} / {pair.token1} (Protocol: {pair.protocol})
                    </li>
                  ))}
                </ul>
              </li>
            ))
          ) : (
            <p>No markets available</p>
          )}
        </ul>
      )}
    </div>
  );
}
