"use client";

import React, { useState, useEffect } from "react";
import { LinkSlashIcon, InformationCircleIcon, ArrowsUpDownIcon } from "@heroicons/react/24/outline";
import ChartComponent from "./DetailsView/ChartComponent";
import { fetchMarketCandles } from "../utils/fetchCandles"; // Adjust the path if necessary
import { useTheme } from "./ThemeContext";
import { Pair, CandleData, ProcessedToken, PoolRiskApiResponseObject, AssetDetails } from "utils/newTypes";
import Image from "next/image";

interface DetailedInfoProps {
  pairData: Pair;
  poolRiskData: PoolRiskApiResponseObject;
  processedTokens: ProcessedToken[];
}

const DetailedInfo: React.FC<DetailedInfoProps> = ({ pairData, poolRiskData, processedTokens }) => {
  const { theme } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [clientSideDate, setClientSideDate] = useState<string | null>(null);
  const [chartData, setChartData] = useState<{
    candlestick: CandleData[];
    overlays: { name: string; data: CandleData[]; color: string }[];
  }>({
    candlestick: [],
    overlays: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tokenMetadata, setTokenMetadata] = useState<{ [key: string]: AssetDetails }>({});

  // Helper function to get token name from processed tokens
  const getTokenName = (tokenId: string): string => {
    const token = processedTokens.find((t) => t.token.id === tokenId);
    return token ? token.token.name : "Unknown Token";
  };

  // Fetch token metadata (AssetDetails)
  const getTokenDetails = async (tokenId: string): Promise<AssetDetails | null> => {
    try {
      const assetId = tokenId.toLowerCase() === "xlm" || tokenId.toLowerCase() === "native" ? "XLM" : tokenId.replace(/:/g, "-");
      const response = await fetch(`/api/tokeninfo/${assetId}`);
      if (!response.ok) throw new Error(`Failed to fetch details for token: ${tokenId} with assetId: ${assetId}`);
      return (await response.json()) as AssetDetails;
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  // Fetch token metadata and candlestick data
  useEffect(() => {
    const fetchChartAndTokenData = async () => {
      setLoading(true);
      setError(null);
      try {
        const assetId0 = getTokenName(pairData.token0);
        const assetId1 = getTokenName(pairData.token1);
        const token0Details = await getTokenDetails(assetId0);
        const token1Details = await getTokenDetails(assetId1);

        if (token0Details && token1Details) {
          setTokenMetadata({
            [pairData.token0]: token0Details,
            [pairData.token1]: token1Details
          });
        }

        const from = Math.floor(Date.now() / 1000) - Number(60 * 60 * 24 * 30); // 30 days ago
        const to = Math.floor(Date.now() / 1000); // Now

        // Fetch candlestick data for the pool's market
        console.log("attempting to fetch candlestick data", pairData.token0, pairData.token1, from, to);
        const candlestick = await fetchMarketCandles(assetId0, assetId1, from, to);
        console.log("Fetched Candlestick Data[1]:", candlestick[0]);

        setChartData({
          candlestick,
          overlays: candlestick.length > 0 ? [{ name: "Classic", data: candlestick, color: "#FF0000" }] : []
        });
      } catch (error) {
        console.error("Error fetching chart or token data:", error);
        setError("Failed to load chart or token data.");
      } finally {
        setLoading(false);
      }
    };

    fetchChartAndTokenData();
  }, [pairData.token0, pairData.token1]);

  // Set Client-Side Date
  useEffect(() => {
    setClientSideDate(new Date(pairData.lastUpdated).toLocaleString());
  }, [pairData.lastUpdated]);

  if (loading) {
    return <div>Loading chart...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Formatters
  // const formatNumber = (num: number): string => new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
  const formatCurrency = (num: number): string => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
  const formatPercentage = (num: number): string => new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 2 }).format(num / 100);

  const { candlestick, overlays } = chartData;

  const t0usd = Number(pairData.t0usd);
  const t1usd = Number(pairData.t1usd);
  console.log("the poolRiskData:", poolRiskData);
  const token0name = getTokenName(pairData.token0);
  const token1name = getTokenName(pairData.token1);
  return (
    <div className={`shadow-lg rounded-lg overflow-hidden ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {pairData.protocol} - {token0name.split(":")[0]} / {token1name.split(":")[0]}
          </h2>
          <div className="flex space-x-2">
            {["Deposit", "Withdraw/Claim", "Swap"].map((action) => (
              <button key={action} className="bg-[#FFB734] hover:bg-[#E6A52F] text-black px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200">
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Chart Component */}
        <div className="mb-6">
          <ChartComponent lineSeries={[{ name: "Candlestick", data: candlestick, color: "#0000FF" }, ...overlays]} />
        </div>

        <div className="info-card-container">
          <InfoCard title="TVL" value={formatCurrency(parseFloat(poolRiskData.totalValueLocked))} />
          <InfoCard title="USD Volume" value={formatCurrency(Number(poolRiskData.volume))} />
          <InfoCard title="Liquidity Utilization" value={formatPercentage(parseFloat(poolRiskData.utilization))} />
          <InfoCard title="Fees" value={formatCurrency(Number(poolRiskData.fees))} />
          <InfoCard title="APR" value={poolRiskData.apr} />
          <InfoCard title="Trending APR" value={poolRiskData.trendingapr} />
        </div>

        <div className="mt-6">
          <button className={`flex items-center ${theme === "dark" ? "text-yellow-400 hover:text-yellow-300" : "text-[#FFB734] hover:text-[#E6A52F]"}`} onClick={() => setIsExpanded(!isExpanded)}>
            {isExpanded ? "Hide" : "Show"} Currency Reserves
            <ArrowsUpDownIcon className="ml-2 h-4 w-4" />
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReserveCard title="Token 0" token={pairData.token0} reserve={pairData.reserve0 || 0} usdValue={t0usd} tokenMetadata={tokenMetadata[pairData.token0]} />
            <ReserveCard title="Token 1" token={pairData.token1} reserve={pairData.reserve1 || 0} usdValue={t1usd} tokenMetadata={tokenMetadata[pairData.token1]} />
            <ReserveCard
              title="Total Reserve (USD)"
              token="Combined"
              reserve={(pairData.reserve0 || 0) * t0usd + (pairData.reserve1 || 0) * t1usd}
              usdValue={(pairData.reserve0 || 0) * t0usd + (pairData.reserve1 || 0) * t1usd}
            />
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Contracts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ContractCard title="Pool" address={pairData.id} />
            <ContractCard title="LP Token" address={pairData.lpToken} />
          </div>
        </div>

        <div className="mt-6 flex items-center text-sm">
          <InformationCircleIcon className="h-4 w-4 mr-2" />
          Last updated: {clientSideDate || "Loading..."}
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  title: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value }) => {
  const { theme } = useTheme();
  return (
    <div className={`info-card-base ${theme === "dark" ? "info-card-light" : "info-card-dark"}`}>
      <h3 className="info-card-title">{title}</h3>
      <p className="info-card-value">{value}</p>
    </div>
  );
};

interface ReserveCardProps {
  title: string;
  token: string;
  reserve: number;
  usdValue: number;
  tokenMetadata?: AssetDetails;
}

const ReserveCard: React.FC<ReserveCardProps> = ({ title, token, reserve, usdValue, tokenMetadata }) => {
  const { theme } = useTheme();
  return (
    <div className={`info-card-base ${theme === "dark" ? "info-card-light" : "info-card-dark"}`}>
      <h3 className="info-card-title">{title}</h3>
      <div className="flex items-center mb-2">
        {tokenMetadata?.toml_info.image ? (
          <Image height={16} width={16} src={tokenMetadata.toml_info.image} alt={tokenMetadata.asset} className="h-6 w-6 mr-2" />
        ) : (
          <div className="h-6 w-6 mr-2 bg-gray-300 rounded-full"></div>
        )}
        <p className="text-xs break-all">{token}</p>
      </div>
      <p className="text-lg font-bold">Reserve: {new Intl.NumberFormat("en-US").format(reserve)}</p>
      <p className="text-sm">USD Value: ${usdValue.toFixed(2)}</p>
    </div>
  );
};

interface ContractCardProps {
  title: string;
  address: string;
}

const ContractCard: React.FC<ContractCardProps> = ({ title, address }) => {
  const { theme } = useTheme();
  return (
    <div className={`info-card-base ${theme === "dark" ? "info-card-light" : "info-card-dark"}`}>
      <h3 className="info-card-title">{title}</h3>
      <div className="flex items-center justify-between">
        <p className="text-sm">{address ? `${address.slice(0, 8)}...${address.slice(-8)}` : "Address not available"}</p>
        {address && <LinkSlashIcon className="h-4 w-4 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors duration-200" />}
      </div>
    </div>
  );
};

export default DetailedInfo;
