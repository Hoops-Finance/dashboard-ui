// app/markets/page.tsx or wherever your MarketsPage is located
'use client';

import { useEffect, useState } from 'react';
import MarketTable from '../../components/MarketTable';
import MarketCard from '../../components/MarketCard';

interface Pool {
  _id: string;
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
  // Include additional fields from pairs data
}

interface TokenDetails {
  _id: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  pairs: {
    pairId: string;
    price: number;
  }[];
}

interface Market {
  marketLabel: string;
  token0: string;
  token1: string;
  token0Details?: TokenDetails;
  token1Details?: TokenDetails;
  pools: Pool[];
  totalTVL?: number; // Add this field to store combined TVL
}

export default function MarketsPage() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchMarketsData();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchMarketsData = async () => {
    setLoading(true);
    try {
      // Fetch markets data
      const response = await fetch('https://api.v1.xlm.services/markets');
      let marketsData: Market[] = await response.json();

      // Fetch pairs data
      const pairsResponse = await fetch('https://api.v1.xlm.services/pairs');
      const pairsData: Pool[] = await pairsResponse.json();

      // Create a map for pairs data for quick lookup
      const pairsDataMap = new Map<string, Pool>();
      pairsData.forEach((pair) => {
        pairsDataMap.set(pair._id, pair);
      });

      // Get unique token addresses from markets data
      const tokenAddresses = new Set<string>();
      marketsData.forEach((market) => {
        tokenAddresses.add(market.token0);
        tokenAddresses.add(market.token1);
      });

      // Fetch token details in parallel
      const tokenDetailsArray = await Promise.all(
        Array.from(tokenAddresses).map(async (address) => {
          const tokenResponse = await fetch(`https://api.v1.xlm.services/tokens/${address}`);
          const tokenDetails: TokenDetails = await tokenResponse.json();
          return tokenDetails;
        })
      );

      // Create a map of token address to token details
      const tokenDetailsMap = new Map<string, TokenDetails>();
      tokenDetailsArray.forEach((token) => {
        tokenDetailsMap.set(token._id, token);
      });

      // Enrich markets data
      marketsData = marketsData.map((market) => {
        // Get token details from map
        const token0Details = tokenDetailsMap.get(market.token0);
        const token1Details = tokenDetailsMap.get(market.token1);

        // Update market label to use token symbols
        if (token0Details && token1Details) {
          market.marketLabel = `${token0Details.symbol} / ${token1Details.symbol}`;
          market.token0Details = token0Details;
          market.token1Details = token1Details;
        }

        // Enrich pools with pairs data and calculate total TVL
        let totalTVL = 0;
        market.pools = market.pools.map((pool) => {
          // Find the corresponding pair data
          const pairData = pairsDataMap.get(pool.pair);

          if (pairData) {
            const enrichedPool = { ...pool, ...pairData };
            if (enrichedPool.tvl) {
              totalTVL += enrichedPool.tvl;
            }
            return enrichedPool;
          } else {
            if (pool.tvl) {
              totalTVL += pool.tvl;
            }
            return pool;
          }
        });

        market.totalTVL = totalTVL;

        return market;
      });

      // Sort markets first by number of pools (descending), then by totalTVL (descending)
      marketsData.sort((a, b) => {
        if (b.pools.length !== a.pools.length) {
          return b.pools.length - a.pools.length;
        } else {
          return (b.totalTVL || 0) - (a.totalTVL || 0);
        }
      });

      setMarkets(marketsData);
    } catch (error) {
      console.error('Error fetching markets data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <h1 className="text-2xl font-bold mb-4">Markets</h1>
      {loading ? (
        <p>Loading...</p>
      ) : markets.length > 0 ? (
        isMobile ? (
          <div className="grid grid-cols-1 gap-4">
            {markets.map((market, index) => (
              <MarketCard key={index} market={market} />
            ))}
          </div>
        ) : (
          <MarketTable data={markets} />
        )
      ) : (
        <p>No markets available</p>
      )}
    </div>
  );
}
