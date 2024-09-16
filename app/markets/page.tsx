"use client";

import { useState, useEffect } from 'react';
import MarketInfo from '../../components/MarketData';

interface MarketData {
  marketCap: number;
  volume24h: number;
  totalPairs: number;
  xlmPrice: number;
  usdcPrice: number;
  marketDominance: number;
  pairs: {
    ranking: number;
    protocol: string;
    pair: string;
    tvl: number;
    volume: number;
    apy: number;
  }[];
  lastUpdated: string;
}

export default function MarketsPage() {
  const [marketData, setMarketData] = useState<MarketData | null>(null);

  useEffect(() => {
    // Fetch market data from an API or use dummy data
    const fetchMarketData = async () => {
      // Replace this with actual API call when available
      const dummyData: MarketData = {
        marketCap: 1000000000,
        volume24h: 50000000,
        totalPairs: 10,
        xlmPrice: 0.1,
        usdcPrice: 1,
        marketDominance: 5,
        pairs: [
          { ranking: 1, protocol: 'StellarX', pair: 'XLM/USDC', tvl: 500000000, volume: 25000000, apy: 5.2 },
          { ranking: 2, protocol: 'StellarTerm', pair: 'XLM/USDT', tvl: 300000000, volume: 15000000, apy: 4.8 },
          // Add more dummy pairs as needed
        ],
        lastUpdated: new Date().toISOString(),
      };
      setMarketData(dummyData);
    };

    fetchMarketData();
  }, []);

  if (!marketData) {
    return <div>Loading...</div>;
  }

  return <MarketInfo marketData={marketData} />;
}