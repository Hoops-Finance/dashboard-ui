// types.ts

import { UTCTimestamp } from "lightweight-charts";
import { SettingUserType } from "@/types/user.ts";

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
  lastUpdated: string; //a string representation of a date in long format like "2024-09-19T00:38:47.826+00:00" this should get converted to a epoch timestamp
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
export interface TokenDetails {
  symbol: string;
  name: string; // "SYMBOL:ISSUER" format
  decimals: number;
}

// Represents a trading pair fetched from the API
export interface PairApiResponseObject {
  _id: string;
  lastUpdated: string; // Converted to epoch timestamp
  lpHolders: string[];
  lptSupply: number;
  protocol: string;
  reserve0: number;
  reserve1: number;
  t0usd: string;
  t1usd: string;
  token0: string; // Token ID
  token1: string; // Token ID
  token0Details?: TokenDetails; // <- Add this
  token1Details?: TokenDetails; // <- Add this
  tvl: number;
  lpToken: string;
  pairType?: string;
}

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
  token0Details?: TokenDetails; // <- Add this
  token1Details?: TokenDetails; // <- Add this
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
  created?: number;
  supply?: number;
  trustlines?: {
    total: number;
    authorized: number;
    funded: number;
  };
  payments?: number;
  payments_amount?: number;
  trades?: number;
  traded_amount?: number;
  price?: number;
  volume?: number;
  volume7d?: number;
  price7d?: number[][]; // Adjust based on actual data structure
  contract: string;
  toml_info?: {
    code?: string;
    issuer?: string;
    name?: string;
    image?: string;
    anchorAssetType?: string;
    anchorAsset?: string;
    orgName?: string;
    orgLogo?: string;
  };
  home_domain?: string;
  rating?: {
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

export type CandleDataRaw = [number, number, number, number, number, number, number];
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

export interface RawCandleRecord {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface SxCandleResponse {
  time: number; //Unix timestamp
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

export interface MetricsProps {
  totalTVL: number;
  totalTokens: number;
  totalPools: number;
  totalProtocols: number;
  totalVolume: number;
  liquidityProviders: number;
  bestAPRPair?: string;
  bestAPR?: number;
}

export interface GlobalMetrics {
  totalValueLocked: number;
  poolsIndexed: number;
  totalVolume: number;
  liquidityProviders: number;
  top5volume: number;
  top5tvl: number;
  top5apr: number;
  bestaprpair: string;
  bestapraddress: string;
  period: "24h" | "7d" | "14d" | "30d" | "90d" | "180d" | "360d";
}

export interface BalanceLineLiquidityPool {
  liquidity_pool_id: string;
  asset_type: "liquidity_pool_shares";
  balance: string;
  limit: string;
  last_modified_ledger: number;
  is_authorized: boolean;
  is_authorized_to_maintain_liabilities: boolean;
  is_clawback_enabled: boolean;
  sponsor?: string;
}

export interface BalanceLineAsset<T extends "credit_alphanum4" | "credit_alphanum12"> {
  balance: string;
  limit: string;
  asset_type: T;
  asset_code: string;
  asset_issuer: string;
  buying_liabilities: string;
  selling_liabilities: string;
  last_modified_ledger: number;
  is_authorized: boolean;
  is_authorized_to_maintain_liabilities: boolean;
  is_clawback_enabled: boolean;
  sponsor?: string;
}
export interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  otherBalances:
    | (BalanceLineAsset<"credit_alphanum4" | "credit_alphanum12"> | BalanceLineLiquidityPool)[]
    | null;
  updateWalletInfo: (
    isConnected: boolean,
    address: string | null,
    balance: string | null,
    otherBalances:
      | (BalanceLineAsset<"credit_alphanum4" | "credit_alphanum12"> | BalanceLineLiquidityPool)[]
      | null,
  ) => void;
}

export interface BalanceLineNative {
  balance: string;
  asset_type: "native";
  buying_liabilities: string;
  selling_liabilities: string;
}

export type BalanceLine =
  | BalanceLineNative
  | BalanceLineAsset<"credit_alphanum4" | "credit_alphanum12">
  | BalanceLineLiquidityPool;

export interface AccountResponse {
  id: string;
  account_id: string;
  balances: BalanceLine[];
}

export interface ApiKeyListResponse {
  success: boolean;
  keys?: ApiKeyEntry[] | null;
  message?: string;
}

export interface ApiKeyEntry {
  name: string;
  key: string;
  createdAt: Date;
  lastUsed: Date | null;
}

export interface MetricsResponse {
  totalValueLocked: number;
  poolsIndexed: number;
  totalVolume: number;
  liquidityProviders: number;
  top5volume: number;
  top5tvl: number;
  top5apr: number;
  bestaprpair: string;
  bestapraddress: string;
  period: string;
}

export interface AuthResult {
  success: boolean;
  result?: "socialunlinked" | "accountlinked" | "loggedin" | "newaccountcreated";
  message?: string;
  email?: string;
  id?: string;
  accessToken?: string;
  refreshToken?: string;
  linkedProviders?: string[];
  error?: string;
}

export interface OAuthLoginRequest {
  provider: string;
  code: string;
  state: string;
}

export type OauthProviders = "google" | "discord";

export interface EmailEntry {
  email: string;
  primary: boolean;
  provider: string;
  verified: boolean;
}

/**
 * The Google user object from the ID token payload:
 * Common fields from `ticket.getPayload()`
 */
export interface GoogleUserResponse {
  iss?: string;
  azp?: string;
  aud?: string;
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  locale?: string;
  hd?: string;
  iat?: number;
  exp?: number;
}

/**
 * The Discord user object from the docs:
 * https://discord.com/developers/docs/resources/user#user-object
 */
export interface DiscordUserResponse {
  id: string;
  username: string;
  discriminator: string;
  global_name?: string | null;
  avatar?: string | null;
  bot?: boolean;
  system?: boolean;
  mfa_enabled?: boolean;
  banner?: string | null;
  accent_color?: number | null;
  locale?: string;
  verified?: boolean;
  email?: string | null;
  flags?: number;
  premium_type?: number;
  public_flags?: number;
  avatar_decoration_data?: unknown;
}

export interface UserProfile {
  _id: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  name?: string;
  phoneNumber?: string;
  avatar?: string;
  emails?: EmailEntry[];
  linkedAccounts: (
    | {
        provider: "google";
        providerId: string | Record<string, unknown>;
        linkedAt: Date;
        providerProfile: GoogleUserResponse;
      }
    | {
        provider: "discord";
        providerId: string | Record<string, unknown>;
        linkedAt: Date;
        providerProfile: DiscordUserResponse;
      }
  )[];
  settings?: SettingUserType;
}
