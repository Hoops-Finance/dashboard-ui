'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  GlobalMetrics, 
  PoolRiskApiResponseObject, 
  Market, 
  Pair, 
  Token, 
  MarketApiResponseObject,  
  TokenApiResponseObject,
  AssetDetails,
  PairApiResponseObject
} from '@/utils/newTypes';

type AllowedPeriods = '24h'|'7d'|'14d'|'30d'|'90d'|'180d'|'360d';

interface DataContextValue {
  loading: boolean;
  globalMetrics: GlobalMetrics | null;
  poolRiskData: PoolRiskApiResponseObject[];
  markets: Market[];
  pairs: Pair[];  
  tokens: Token[];
  period: AllowedPeriods;
  setPeriod: (p: AllowedPeriods) => void;
  fetchCandles: (token0: string, token1: string | null, from: number, to: number) => Promise<any>;
  fetchTokenDetails: (asset: string) => Promise<AssetDetails | null>;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [poolRiskData, setPoolRiskData] = useState<PoolRiskApiResponseObject[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [period, setPeriodState] = useState<AllowedPeriods>('14d'); // default

  const convertToEpoch = (dateStr: string): number => new Date(dateStr).getTime();

  const processCoreData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch from our proxy route
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Failed to fetch core data');

      const { markets: marketsData, pairs: pairsData, tokens: tokensData } = await res.json() as {
        markets: MarketApiResponseObject[],
        pairs: PairApiResponseObject[],
        tokens: TokenApiResponseObject[]
      };

      const convertedTokens: Token[] = tokensData.map(token => ({
        ...token,
        id: token._id,
        lastUpdated: convertToEpoch(token.lastupdated)
      }));

      const convertedPairs: Pair[] = pairsData.map(pair => ({
        ...pair,
        id: pair._id,
        lastUpdated: convertToEpoch(pair.lastUpdated)
      }));
      
      const tokenMap = new Map(convertedTokens.map(t => [t.id, t]));
      const pairMap = new Map(convertedPairs.map(p => [p.id, p]));

      const convertedMarkets: Market[] = marketsData.map(m => {
        const token0 = tokenMap.get(m.token0);
        const token1 = tokenMap.get(m.token1);
        let totalTVL = 0;
        const enrichedPools = m.pools.map(poolRef => {
          const p = pairMap.get(poolRef.pair);
          if (p) {
            totalTVL += p.tvl || 0;
            return p;
          }
          throw new Error(`Pair not found: ${poolRef.pair}`);
        });
        const marketLabel = token0 && token1 ? `${token0.symbol} / ${token1.symbol}` : "Unknown";
        return {
          ...m,
          id: m.marketLabel,
          token0: token0!,
          token1: token1!,
          pools: enrichedPools,
          marketLabel,
          totalTVL
        };
      });

      setMarkets(convertedMarkets);
      setPairs(convertedPairs);
      setTokens(convertedTokens);

    } catch (error) {
      console.error('Error processing core data:', error);
      setMarkets([]);
      setPairs([]);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPeriodData = useCallback(async (p: AllowedPeriods) => {
    // DO NOT toggle loading here to avoid infinite loop
    // This fetch is done after initial data load, so no need to change `loading`.
    try {
      const [metricsRes, statsRes] = await Promise.all([
        fetch(`/api/getmetrics?period=${p}`),
        fetch(`/api/getstatistics?period=${p}`)
      ]);

      if (!metricsRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch period-based data');
      }

      const gm = await metricsRes.json() as GlobalMetrics;
      const ps = await statsRes.json() as PoolRiskApiResponseObject[];

      setGlobalMetrics(gm);
      setPoolRiskData(ps);
    } catch (error) {
      console.error('Error fetching period data:', error);
      setGlobalMetrics(null);
      setPoolRiskData([]);
    }
  }, []);

  useEffect(() => {
    // First load: fetch core data (markets, pairs, tokens)
    processCoreData();
  }, [processCoreData]);

  useEffect(() => {
    // Whenever period changes, fetch global metrics and pool stats
    // Only fetch if core data is loaded and available
    if (!loading && tokens.length > 0 && pairs.length > 0 && markets.length > 0) {
      fetchPeriodData(period);
    }
  }, [period, fetchPeriodData, loading, tokens.length, pairs.length, markets.length]);

  const setPeriod = (p: AllowedPeriods) => {
    setPeriodState(p);
  };

  const fetchCandles = async (token0: string, token1: string | null, from: number, to: number) => {
    const normalize = (t: string) =>
      t.toLowerCase() === 'xlm' || t.toLowerCase() === 'native' ? 'XLM' : t.replace(/:/g, '-');

    const t0 = normalize(token0);
    let endpoint: string;
    if (token1) {
      const t1 = normalize(token1);
      endpoint = `/api/candles/${t0}/${t1}?from=${from}&to=${to}`;
    } else {
      endpoint = `/api/candles/${t0}?from=${from}&to=${to}`;
    }

    const res = await fetch(endpoint);
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Failed to fetch candles');
    }
    return res.json();
  };

  const fetchTokenDetails = async (asset: string): Promise<AssetDetails | null> => {
    const a = asset.toLowerCase() === 'xlm' || asset.toLowerCase() === 'native' ? 'XLM' : asset.replace(/:/g, '-');
    const res = await fetch(`/api/tokeninfo/${a}`);
    if (!res.ok) {
      console.error(`Failed to fetch token details for ${asset}`);
      return null;
    }
    return res.json() as Promise<AssetDetails>;
  };

  const value: DataContextValue = {
    loading,
    globalMetrics,
    poolRiskData,
    markets,
    pairs,
    tokens,
    period,
    setPeriod,
    fetchCandles,
    fetchTokenDetails
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useDataContext must be used within DataProvider');
  }
  return context;
}
