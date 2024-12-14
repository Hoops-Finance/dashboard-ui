'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { 
  GlobalMetrics, 
  PoolRiskApiResponseObject, 
  Market, 
  Pair, 
  Token, 
  ExplorerTableData, 
  MarketApiResponseObject, 
  PairApiResponseObject, 
  TokenApiResponseObject,
  AssetDetails
} from '@/utils/newTypes';

type Period = string; 
// Allowed common periods, but we also allow custom: "24h"|"7d"|"14d"|"30d"|"90d"|"180d"|"360d" or any custom string.

interface DataContextValue {
  loading: boolean;
  // Data sets
  globalMetrics: GlobalMetrics | null;
  poolRiskData: PoolRiskApiResponseObject[];
  markets: Market[];
  pairs: Pair[];
  tokens: Token[];

  // Period state
  period: Period;
  setPeriod: (p: Period) => void;

  // On-demand fetch methods
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
  const [period, setPeriod] = useState<Period>('14d'); // default to 14d as per request

  // Utility function: Convert date string to epoch
  const convertToEpoch = (dateStr: string): number => new Date(dateStr).getTime();

  // Process initial markets, pairs, tokens into Market[], Pair[], Token[]
  const processCoreData = useCallback(async () => {
    setLoading(true);
    try {
      const [marketsRes, pairsRes, tokensRes] = await Promise.all([
        fetch('/api/markets'),
        fetch('/api/pairs'),
        fetch('/api/tokens')
      ]);

      if (!marketsRes.ok || !pairsRes.ok || !tokensRes.ok) {
        throw new Error('Failed to fetch core data (markets/pairs/tokens)');
      }

      const marketsData: MarketApiResponseObject[] = await marketsRes.json();
      const pairsData: PairApiResponseObject[] = await pairsRes.json();
      const tokensData: TokenApiResponseObject[] = await tokensRes.json();

      // Convert tokens
      const convertedTokens: Token[] = tokensData.map(token => ({
        id: token._id,
        symbol: token.symbol,
        name: token.name,
        decimals: token.decimals,
        price: token.price,
        pairs: token.pairs,
        lastUpdated: convertToEpoch(token.lastupdated),
      }));

      const pairsMap = new Map<string, Pair>();
      const convertedPairs: Pair[] = pairsData.map(pair => {
        const p: Pair = {
          id: pair._id,
          lastUpdated: convertToEpoch(pair.lastUpdated),
          lpHolders: pair.lpHolders,
          lptSupply: pair.lptSupply,
          protocol: pair.protocol,
          reserve0: pair.reserve0,
          reserve1: pair.reserve1,
          t0usd: pair.t0usd,
          t1usd: pair.t1usd,
          token0: pair.token0,
          token1: pair.token1,
          tvl: pair.tvl,
          lpToken: pair.lpToken,
          pairType: pair.pairtype
        };
        pairsMap.set(p.id, p);
        return p;
      });

      const tokensMap = new Map<string, Token>();
      convertedTokens.forEach(t => tokensMap.set(t.id, t));

      // Enrich markets
      const convertedMarkets: Market[] = marketsData.map(m => {
        const token0 = tokensMap.get(m.token0);
        const token1 = tokensMap.get(m.token1);
        const marketLabel = token0 && token1 ? `${token0.symbol} / ${token1.symbol}` : "Unknown";

        let totalTVL = 0;
        const enrichedPools: Pair[] = m.pools.map(poolRef => {
          const p = pairsMap.get(poolRef.pair);
          if (p) {
            totalTVL += p.tvl || 0;
            return p;
          }
          throw new Error(`Pair not found: ${poolRef.pair}`);
        });

        return {
          id: m.marketLabel,
          token0: token0!,
          token1: token1!,
          pools: enrichedPools,
          marketLabel,
          totalTVL,
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

  // Fetch data that depends on period: globalMetrics and poolRiskData
  const fetchPeriodData = useCallback(async (p: Period) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // First load: fetch core data (markets, pairs, tokens)
    processCoreData();
  }, [processCoreData]);

  useEffect(() => {
    // Whenever period changes, fetch global metrics and pool stats
    // but only if we have already fetched core data once (tokens not empty or ended loading)
    if (!loading && tokens.length > 0 && pairs.length > 0 && markets.length > 0) {
      fetchPeriodData(period);
    }
  }, [period, fetchPeriodData, loading, tokens.length, pairs.length, markets.length]);

  const fetchCandles = async (token0: string, token1: string | null, from: number, to: number) => {
    // Normalize tokens: 'XLM' or replace ':' with '-'
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
    // Normalize like candles
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
    fetchTokenDetails,
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
