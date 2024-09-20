import { TokenPair, TokenToken, TokenData, TokenMarket } from "./types";

export const fetchTokenData = async (setTokens: (data: TokenToken[]) => void, setLoading: (value: boolean) => void) => {
  setLoading(true);
  try {
    // Fetch tokens data
    const response = await fetch("https://api.v1.xlm.services/tokens");
    const tokensData: TokenData[] = await response.json();

    // Fetch pairs data
    const pairsResponse = await fetch("https://api.v1.xlm.services/pairs");
    const pairsData: TokenPair[] = await pairsResponse.json();

    // Create a map of tokens by _id for quick lookup
    const tokensMap = new Map<string, TokenData>();
    tokensData.forEach((token) => {
      tokensMap.set(token._id, token);
    });

    // Process tokens
    const processedTokens: TokenToken[] = tokensData.map((token) => {
      // For each token, get the pairs it's in
      const tokenPairs = pairsData.filter((pair) => pair.token0 === token._id || pair.token1 === token._id);

      // Organize pairs by markets (counter tokens)
      const marketsMap = new Map<string, TokenMarket>();

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
              totalTVL: 0
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
        totalTVL
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
    console.error("Error fetching tokens data:", error);
  } finally {
    setLoading(false);
  }
};
