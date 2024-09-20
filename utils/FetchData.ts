import { Market, Pool, TokenDetails } from "./types";

export const fetchData = async (setTabData: (data: { markets: Market[]; pools: Pool[]; tokens: TokenDetails[] }) => void, setLoading: (value: boolean) => void) => {
  try {
    const [marketsResponse, pairsResponse, tokensResponse] = await Promise.all([
      fetch("https://api.v1.xlm.services/markets"),
      fetch("https://api.v1.xlm.services/pairs"),
      fetch("https://api.v1.xlm.services/tokens")
    ]);

    let marketsData: Market[] = await marketsResponse.json();
    const pairsData: Pool[] = await pairsResponse.json();
    const tokensData: TokenDetails[] = await tokensResponse.json();

    const pairsDataMap = new Map<string, Pool>();
    const tokenDetailsMap = new Map<string, TokenDetails>();

    pairsData.forEach((pair) => pairsDataMap.set(pair._id, pair));
    tokensData.forEach((token) => tokenDetailsMap.set(token._id, token));

    marketsData = marketsData.map((market) => {
      const token0Details = tokenDetailsMap.get(market.token0);
      const token1Details = tokenDetailsMap.get(market.token1);

      if (token0Details && token1Details) {
        market.marketLabel = `${token0Details.symbol} / ${token1Details.symbol}`;
        market.token0Details = token0Details;
        market.token1Details = token1Details;
      }

      let totalTVL = 0;
      market.pools = market.pools.map((pool) => {
        const pairData = pairsDataMap.get(pool.pair);
        if (pairData) {
          const enrichedPool = { ...pool, ...pairData };
          totalTVL += enrichedPool.tvl || 0;
          return enrichedPool;
        }
        return pool;
      });

      market.totalTVL = totalTVL;
      return market;
    });

    setTabData({ markets: marketsData, tokens: tokensData, pools: pairsData });
  } catch (error) {
    console.error("Error fetching data:", error);
  } finally {
    setLoading(false);
  }
};
