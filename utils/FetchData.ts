// fetchData.ts

import { PairApiResponseObject, Token, ExplorerTableData, ProcessedToken, TokenMarket, Pair, Market, MarketApiResponseObject, TokenApiResponseObject } from "./types";

// Utility function to convert date strings to epoch timestamps
const convertToEpoch = (dateStr: string): number => new Date(dateStr).getTime();

export const fetchData = async (setExplorerTableData: (data: ExplorerTableData) => void, setProcessedTokens: (data: ProcessedToken[]) => void, setLoading: (value: boolean) => void) => {
  setLoading(true);
  try {
    // Fetch markets, pairs, and tokens concurrently
    const [marketsResponse, pairsResponse, tokensResponse] = await Promise.all([
      fetch(`${process.env.NEXT_PUBLIC_BASE_DATA_URI}/markets`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_DATA_URI}/pairs`),
      fetch(`${process.env.NEXT_PUBLIC_BASE_DATA_URI}/tokens`)
    ]);

    // Parse JSON responses
    const marketsData: MarketApiResponseObject[] = await marketsResponse.json();
    const pairsData: PairApiResponseObject[] = await pairsResponse.json();
    const tokensData: TokenApiResponseObject[] = await tokensResponse.json();

    // Convert tokens and pairs to desired types with epoch timestamps
    const tokens: Token[] = tokensData.map((token) => ({
      ...token,
      id: token._id,
      lastUpdated: convertToEpoch(token.lastupdated)
    }));

    const pairs: Pair[] = pairsData.map((pair) => ({
      ...pair,
      id: pair._id,
      lastUpdated: convertToEpoch(pair.lastUpdated)
    }));

    // Create Maps for quick lookup
    const tokensMap = new Map<string, Token>();
    tokens.forEach((token) => tokensMap.set(token.id, token));

    const pairsMap = new Map<string, Pair>();
    pairs.forEach((pair) => pairsMap.set(pair.id, pair));

    // Enrich markets with token details and pools
    const enrichedMarkets: Market[] = marketsData.map((market) => {
      const token0 = tokensMap.get(market.token0);
      const token1 = tokensMap.get(market.token1);

      const marketLabel = token0 && token1 ? `${token0.symbol} / ${token1.symbol}` : "Unknown";

      let totalTVL = 0;
      const enrichedPools: Pair[] = market.pools.map((pool) => {
        const pair = pairsMap.get(pool.pair);
        if (pair) {
          totalTVL += pair.tvl || 0;
          return pair;
        }
        throw new Error(`Pair not found for ID: ${pool.pair}`);
      });

      return {
        id: market.marketLabel,
        token0: token0!,
        token1: token1!,
        pools: enrichedPools,
        marketLabel,
        totalTVL
      };
    });

    // Set ExplorerTableData
    setExplorerTableData({ markets: enrichedMarkets, pools: pairs, tokens });

    // Process tokens into ProcessedToken[]
    const processedTokens: ProcessedToken[] = tokens.map((token) => {
      // Find all pairs involving this token
      const tokenPairs = pairs.filter((pair) => pair.token0 === token.id || pair.token1 === token.id);

      // Map to hold markets associated with this token
      const marketsMap = new Map<string, TokenMarket>();

      tokenPairs.forEach((pair) => {
        const counterTokenId = pair.token0 === token.id ? pair.token1 : pair.token0;
        const counterToken = tokensMap.get(counterTokenId);
        if (counterToken) {
          const marketKey = counterToken.symbol;

          if (!marketsMap.has(marketKey)) {
            marketsMap.set(marketKey, {
              counterTokenSymbol: counterToken.symbol,
              counterTokenDetails: counterToken,
              pairs: [],
              totalTVL: 0
            });
          }

          const market = marketsMap.get(marketKey)!;
          market.pairs.push(pair);
          market.totalTVL += pair.tvl || 0;
        }
      });

      const markets = Array.from(marketsMap.values());

      return {
        token,
        markets,
        numberOfMarkets: markets.length,
        totalTVL: markets.reduce((sum, market) => sum + market.totalTVL, 0)
      };
    });

    // Filter out tokens without any markets
    const tokensWithMarkets = processedTokens.filter((token) => token.numberOfMarkets > 0);

    // Sort tokens by number of markets and total TVL
    tokensWithMarkets.sort((a, b) => {
      if (b.numberOfMarkets !== a.numberOfMarkets) {
        return b.numberOfMarkets - a.numberOfMarkets;
      }
      return b.totalTVL - a.totalTVL;
    });

    // Set Processed Tokens
    setProcessedTokens(tokensWithMarkets);
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setLoading(false);
  }
};
