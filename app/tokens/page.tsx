// app/tokens/page.tsx
'use client';

import { useEffect, useState } from 'react';
import TokenTable from '../../components/TokenTable';
import TokenCard from '../../components/TokenCard';

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

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    fetchTokens();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const fetchTokens = async () => {
    setLoading(true);
    try {
      // Fetch tokens data
      const response = await fetch('https://api.v1.xlm.services/tokens');
      const tokensData: TokenData[] = await response.json();

      // Fetch pairs data
      const pairsResponse = await fetch('https://api.v1.xlm.services/pairs');
      const pairsData: Pair[] = await pairsResponse.json();

      // Create a map of tokens by _id for quick lookup
      const tokensMap = new Map<string, TokenData>();
      tokensData.forEach((token) => {
        tokensMap.set(token._id, token);
      });

      // Process tokens
      const processedTokens: Token[] = tokensData.map((token) => {
        // For each token, get the pairs it's in
        const tokenPairs = pairsData.filter(
          (pair) => pair.token0 === token._id || pair.token1 === token._id
        );

        // Organize pairs by markets (counter tokens)
        const marketsMap = new Map<string, Market>();

        tokenPairs.forEach((pair) => {
          const counterTokenId = pair.token0 === token._id ? pair.token1 : pair.token0;
          const counterTokenDetails = tokensMap.get(counterTokenId);

          if (counterTokenDetails) {
            const marketKey = counterTokenDetails.symbol;

            if (!marketsMap.has(marketKey)) {
              marketsMap.set(marketKey, {
                counterTokenSymbol: counterTokenDetails.symbol,
                counterTokenDetails,
                pairs: [],
                totalTVL: 0,
              });
            }

            const market = marketsMap.get(marketKey)!;
            market.pairs.push(pair);
            market.totalTVL += pair.tvl || 0;
          }
        });

        // Convert markets map to array
        const markets = Array.from(marketsMap.values());

        // Calculate number of markets and total TVL
        const numberOfMarkets = markets.length;
        const totalTVL = markets.reduce((sum, market) => sum + market.totalTVL, 0);

        // Sort markets by totalTVL descending
        markets.sort((a, b) => b.totalTVL - a.totalTVL);

        return {
          tokenData: token,
          markets,
          numberOfMarkets,
          totalTVL,
        };
      });

      // Filter out tokens that don't have any markets
      const tokensWithMarkets = processedTokens.filter((token) => token.numberOfMarkets > 0);

      // Sort tokens
      tokensWithMarkets.sort((a, b) => {
        if (b.numberOfMarkets !== a.numberOfMarkets) {
          return b.numberOfMarkets - a.numberOfMarkets;
        } else {
          return b.totalTVL - a.totalTVL;
        }
      });

      setTokens(tokensWithMarkets);
    } catch (error) {
      console.error('Error fetching tokens data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <h1 className="text-2xl font-bold mb-4">Tokens</h1>
      {loading ? (
        <p>Loading...</p>
      ) : tokens.length > 0 ? (
        isMobile ? (
          <div className="grid grid-cols-1 gap-4">
            {tokens.map((token, index) => (
              <TokenCard key={index} token={token} />
            ))}
          </div>
        ) : (
          <TokenTable data={tokens} />
        )
      ) : (
        <p>No tokens available</p>
      )}
    </div>
  );
}
