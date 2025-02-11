"use client";

import { createContext, useContext, useState, useEffect, useCallback, FC, ReactNode } from "react";
import type {
  GlobalMetrics,
  PoolRiskApiResponseObject,
  Market,
  Pair,
  Token,
  AssetDetails,
  TransformedCandleData,
} from "@/utils/types";
import { AllowedPeriods } from "@/utils/utilities";

// Import everything from data.service.ts:
import {
  fetchCoreData,
  fetchPeriodData,
  fetchCandles as serviceFetchCandles,
  fetchTokenDetails as serviceFetchTokenDetails,
  getPairsForToken as serviceGetPairsForToken,
  buildPoolRoute as serviceBuildPoolRoute,
} from "@/services/data.service";

interface DataContextValue {
  loading: boolean;
  globalMetrics: GlobalMetrics | null;
  poolRiskData: PoolRiskApiResponseObject[];
  markets: Market[];
  pairs: Pair[];
  tokens: Token[];
  period: AllowedPeriods;
  setPeriod: (p: AllowedPeriods) => void;
  fetchCandles: (
    token0: string,
    token1: string | null,
    from: number,
    to: number,
  ) => Promise<TransformedCandleData[]>;
  fetchTokenDetails: (asset: string) => Promise<AssetDetails | null>;
  getPairsForToken: (token: Token) => Pair[];
  buildPoolRoute: (pool: PoolRiskApiResponseObject) => string;
}

const DataContext = createContext<DataContextValue | undefined>(undefined);

export const DataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [globalMetrics, setGlobalMetrics] = useState<GlobalMetrics | null>(null);
  const [poolRiskData, setPoolRiskData] = useState<PoolRiskApiResponseObject[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([]);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [period, setPeriodState] = useState<AllowedPeriods>("14d"); // default

  /**
   * Load the core data once on mount.
   */
  const processCoreData = useCallback(async () => {
    setLoading(true);
    try {
      const { markets, pairs, tokens } = await fetchCoreData();
      setMarkets(markets);
      setPairs(pairs);
      setTokens(tokens);
    } catch (error) {
      console.error("Error loading core data:", error);
      setMarkets([]);
      setPairs([]);
      setTokens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch data that depends on the 'period' (like metrics, pool stats, etc.).
   */
  const processPeriodData = useCallback(async (p: AllowedPeriods) => {
    try {
      const { globalMetrics, poolRiskData } = await fetchPeriodData(p);
      setGlobalMetrics(globalMetrics);
      setPoolRiskData(poolRiskData);
    } catch (error) {
      console.error("Error fetching period-based data:", error);
      setGlobalMetrics(null);
      setPoolRiskData([]);
    }
  }, []);

  useEffect(() => {
    void processCoreData();
  }, [processCoreData]);

  useEffect(() => {
    // Only fetch period-based data once core data is loaded
    if (!loading && tokens.length > 0 && pairs.length > 0 && markets.length > 0) {
      void processPeriodData(period);
    }
  }, [period, processPeriodData, loading, tokens.length, pairs.length, markets.length]);

  const setPeriod = (p: AllowedPeriods) => {
    setPeriodState(p);
  };

  /**
   * Attach the same signature to these methods as the original DataContext,
   * but delegate to the service functions.
   */
  const fetchCandles = async (token0: string, token1: string | null, from: number, to: number) => {
    return serviceFetchCandles(token0, token1, from, to);
  };

  const fetchTokenDetails = async (asset: string) => {
    return serviceFetchTokenDetails(asset);
  };

  const getPairsForToken = (token: Token) => {
    return serviceGetPairsForToken(token, pairs);
  };

  const buildPoolRoute = (pool: PoolRiskApiResponseObject) => {
    return serviceBuildPoolRoute(pool, pairs, tokens, period);
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
    getPairsForToken,
    buildPoolRoute,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useDataContext() {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useDataContext must be used within DataProvider");
  }
  return context;
}
