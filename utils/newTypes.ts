// types.ts

import { UTCTimestamp } from "lightweight-charts";

// Represents the price information of a pair related to a token
export interface TokenPairPrice {
  pairId: string;
  price: number;
}

export interface TokenApiResponseObject {
  _id: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  pairs: TokenPairPrice[];
  lastupdated: string; //a string representation of a date in long format like "2024-09-19T00:38:47.826+00:00" this should get converted to a epoch timestamp
}
// Represents a token fetched from the API
export interface Token {
  id: string; // Renamed from _id for clarity
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  pairs: TokenPairPrice[];
  logoUrl?: string;
  lastUpdated: number; // Converted to epoch timestamp
}
export interface PairApiResponseObject {
  _id: string;
  lastUpdated: string;
  lpHolders: string[];
  lptSupply: number;
  protocol: string;
  reserve0: number;
  reserve1: number;
  t0usd: string;
  t1usd: string;
  token0: string;
  token1: string;
  tvl: number;
  lpToken: string;
  pairtype?: string;
}

// Represents a trading pair fetched from the API
export interface Pair {
  id: string; // Renamed from _id
  lastUpdated: number; // Converted to epoch timestamp
  lpHolders: string[];
  lptSupply: number;
  protocol: string;
  reserve0: number;
  reserve1: number;
  t0usd: string;
  t1usd: string;
  token0: string; // Token ID
  token1: string; // Token ID
  tvl: number;
  lpToken: string;
  pairType?: string;
}
export interface MarketApiResponseObject {
  marketLabel: string;
  token0: string;
  token1: string;
  token0Details?: TokenApiResponseObject;
  token1Details?: TokenApiResponseObject;
  pools: MarketPoolPairObject[];
  totalTVL?: number;
}

export interface MarketPoolPairObject {
  protocol: string; // 'aqua' | 'soroswap' | 'phoenix' | 'comet' | string
  pair: string; // _id in the PairApiResponseObject
}

// Represents a market fetched from the API
export interface Market {
  id: string;
  token0: Token;
  token1: Token;
  pools: Pair[];
  marketLabel: string;
  totalTVL: number;
}

// Represents the overall data structure fetched for the explorer
export interface ExplorerTableData {
  markets: Market[];
  pools: Pair[];
  tokens: Token[];
}

// Represents a market associated with a specific token
export interface TokenMarket {
  counterTokenSymbol: string;
  counterTokenDetails: Token;
  pairs: Pair[];
  totalTVL: number;
}

// Represents the processed token data used in the tokens tab
export interface ProcessedToken {
  token: Token;
  markets: TokenMarket[];
  numberOfMarkets: number;
  totalTVL: number;
}

export interface PoolRiskApiResponseObject {
  pairId: string;
  marketIcon: string;
  market: string;
  totalValueLocked: string;
  volume: string;
  fees: string;
  apr: string;
  trendingapr: string;
  utilization: string;
  protocol: string;
  riskFactors: RiskFactors;
  riskScore: string;
  rankingFactors: RankingFactors;
  rankingScore: string;
}

export interface RiskFactors {
  score: number;
  age: number;
  normalizedAge: number;
  normalizedTVL: number;
  normalizedNumSwaps: number;
  normalizedNumLiquidityEvents: number;
  normalizedLiquidityDistribution: number;
  totalLiquidityEvents: number;
  ageInYears: number;
  TotalNumSwaps: number;
  numSwappers: number;
}

export interface MyWalletData {
  assetType: string;
  assetCode: string;
  assetIssuer: string;
  balance: string;
}

export interface RankingFactors {
  score: number;
  normalizedTVL: number;
  normalizedNumSwaps: number;
}

export interface AssetDetails {
  // Define properties based on Stellar Expert's token details response
  asset: string;
  created: number;
  supply: number;
  trustlines: {
    total: number;
    authorized: number;
    funded: number;
  };
  payments: number;
  payments_amount: number;
  trades: number;
  traded_amount: number;
  price: number;
  volume: number;
  volume7d: number;
  price7d: any[]; // Adjust based on actual data structure
  contract: string;
  toml_info: {
    code: string;
    issuer: string;
    name: string;
    image: string;
    anchorAssetType: string;
    anchorAsset: string;
    orgName: string;
    orgLogo: string;
  };
  home_domain: string;
  rating: {
    age: number;
    trades: number;
    payments: number;
    trustlines: number;
    volume7d: number;
    interop: number;
    liquidity: number;
    average: number;
  };
}

export interface TransformedCandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
  baseVolume: number;
  quoteVolume: number;
  tradesCount: number;
}

export interface CandleData {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SxCandleResponse {
  time: string; //Unix timestamp
  open: number; //Open price
  high: number; //High price
  low: number; //Low price
  baseVolume: number; //Base volume
  quoteVolume: number; //Quote volume
  tradesCount: number; //Trades count in the record
}

export interface ContractCardProps {
  title: string;
  address: string;
}

export interface InfoCardProps {
  title: string;
  value: string;
}
export interface ReserveCardProps {
  title: string;
  token: string;
  reserve: number;
  usdValue: number;
}
