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

export interface RankingFactors {
  score: number;
  normalizedTVL: number;
  normalizedNumSwaps: number;
}

export interface PoolData {
  pairId: string;
  marketIcon: string;
  market: string;
  totalValueLocked: string;
  volume: string;
  fees: string;
  apr: string;
  trendingapr?: string;
  utilization: string;
  protocol: string;
  riskFactors: RiskFactors;
  riskScore: string;
  rankingFactors: RankingFactors;
  rankingScore: string;
}

export interface Pool {
  _id: string;
  protocol: string;
  pair: string;
  tvl: number;
  reserve0?: number;
  reserve1?: number;
  token0: string;
  token1: string;
}

export interface PoolDataCardProps {
  marketIcon: string;
  market: string;
  protocol: string;
  totalValueLocked: string;
  volume: string;
  fees: string;
  apr: string;
  trendingapr: string;
  utilization: string;
  riskScore: string;
}

export interface Market {
  marketLabel: string;
  token0: string;
  token1: string;
  token0Details?: TokenDetails;
  token1Details?: TokenDetails;
  pools: Pool[];
  totalTVL?: number;
}

export interface MarketCardProps {
  market: Market;
}

export interface MyWalletData {
  assetType: string;
  assetCode: string;
  assetIssuer: string;
  balance: string;
}

export interface TabData {
  markets: Market[];
  pools: Pool[];
  tokens: TokenDetails[];
}

interface RawDBPoolDataResponse {
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
}

export interface TokenPair {
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

export interface TokenData {
  _id: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
  issuer: string;
  logoUrl?: string;
}

export interface TokenMarket {
  counterTokenSymbol: string;
  counterTokenDetails: TokenData;
  pairs: TokenPair[];
  totalTVL: number;
}

export interface TokenToken {
  tokenData: TokenData;
  markets: TokenMarket[];
  numberOfMarkets: number;
  totalTVL: number;
}
export interface TokenDetails {
  _id: string;
  symbol: string;
  name: string;
  decimals: number;
  price: number;
}
