// /components/DetailedInfo.tsx

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
  // State Hooks
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
    if (!token) return "Unknown Token";
    return token.token.name;
  };

  // Fetch token metadata (AssetDetails)
  const getTokenDetails = async (tokenId: string): Promise<AssetDetails | null> => {
    try {
      // tokenId.match(/:/g) ? tokenId.replace(/:/g, "-") : tokenId;
      let assetId;
      if (tokenId.toLowerCase() === "xlm" || tokenId.toLowerCase() === "native") {
        assetId = "XLM";
      } else {
        assetId = tokenId.replace(/:/g, "-");
      }
      const response = await fetch(`/api/tokeninfo/${assetId}`);
      if (!response.ok) throw new Error(`Failed to fetch details for token: ${tokenId} with assetId: ${assetId}`);
      const data: AssetDetails = await response.json();
      return data;
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
        // const tokenC0Details = await getTokenDetails(pairData.token0);
        // const tokenC1Details = await getTokenDetails(pairData.token1);
        const token0Details = await getTokenDetails(assetId0);
        const token1Details = await getTokenDetails(assetId1);
        // example tokencontract details:
        //{"asset":"CAS3J7GYLGXMF6TDJBBYYSE3HQ6BBSMLNUQ34T6TZMYMW2EVH34XOWMA","created":1708482496,"supply":2695131717580,"trustlines":{"total":0,"authorized":0,"funded":37},"payments":288,"payments_amount":337509325869,"volume":null,"volume7d":null,"rating":{"age":6,"trades":0,"payments":3,"trustlines":3,"volume7d":0,"interop":1,"liquidity":0,"average":1.9}}

        if (token0Details && token1Details) {
          setTokenMetadata({
            [pairData.token0]: token0Details,
            [pairData.token1]: token1Details
          });
        }

        const from = Math.floor(Date.now() / 1000) - Number(60 * 60 * 24 * 30); // 30 days ago
        const to = Math.floor(Date.now() / 1000); // Now

        // Fetch candlestick data for the pool's market
        console.log("attempting to fetch candlestick data");
        console.log(pairData.token0, pairData.token1, from, to);

        //const candlestick_contractid = await fetchMarketCandles(pairData.token0, pairData.token1, from, to);
        const candlestick = await fetchMarketCandles(assetId0, assetId1, from, to);
        //console.log("Fetched Candlestick Data[0]:", candlestick_contractid);
        console.log("Fetched Candlestick Data[1]:", candlestick[0]);

        setChartData({
          candlestick,
          overlays:
            candlestick.length > 0
              ? [
                  {
                    name: "Classic",
                    data: candlestick,
                    color: "#FF0000" // Example color
                  }
                  // Add more overlays as needed
                ]
              : [] // If no overlays, pass an empty array
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

  // Conditional Rendering
  if (loading) {
    return <div>Loading chart...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Formatters
  /*
  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 }).format(num);
  };
*/
  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num);
  };

  const formatPercentage = (num: number): string => {
    return new Intl.NumberFormat("en-US", { style: "percent", minimumFractionDigits: 2 }).format(num / 100);
  };

  const { candlestick, overlays } = chartData;

  /*
  // Prepare data for the ChartComponent
  const prepareChartData = () => {
    const candlestickData = chartData.candlestick.map((record: CandleData) => ({
      time: record.time,
      open: record.open,
      high: record.high,
      low: record.low,
      close: record.close
    }));

    const overlays = chartData.overlays.map((overlay) => ({
      name: overlay.name,
      data: overlay.data.map((record: CandleData) => ({
        time: record.time,
        open: record.open,
        high: record.high,
        low: record.low,
        close: record.close
      })),
      color: overlay.color
    }));

    return {
      candlestick: candlestickData,
      overlays: overlays
    };
  };
  const { candlestick, overlays } = prepareChartData();

*/

  /*
  const chartSeries: any[] = [
    {
      name: "Candlestick",
      data: candlestick,
      color: "#0000FF" // Candlestick color
    },
    ...overlays
  ];
  */
  const t0usd = Number(pairData.t0usd);
  const t1usd = Number(pairData.t1usd);
  console.log("the poolRiskData:", poolRiskData);
  return (
    <div className={`shadow-lg rounded-lg overflow-hidden ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-black"}`}>
      {" "}
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {pairData.protocol} - {getTokenName(pairData.token0)} / {getTokenName(pairData.token1)}{" "}
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
          {/*<ChartComponent lineSeries={chartSeries} />*/}
          <ChartComponent lineSeries={[{ name: "Candlestick", data: candlestick, color: "#0000FF" }, ...overlays]} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
    <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-50 text-black"}`}>
      <h3 className="text-sm font-medium">{title}</h3>
      <p className="text-xl font-bold">{value}</p>
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
    <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-50 text-black"}`}>
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="flex items-center mb-2">
        {tokenMetadata?.toml_info.image ? (
          <Image height={20} width={20} src={tokenMetadata.toml_info.image} alt={tokenMetadata.asset} className="h-6 w-6 mr-2" />
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
    <div className={`p-4 rounded-lg ${theme === "dark" ? "bg-gray-700 text-white" : "bg-gray-50 text-black"}`}>
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="flex items-center justify-between">
        <p className="text-sm">{address ? `${address.slice(0, 8)}...${address.slice(-8)}` : "Address not available"}</p>
        {address && <LinkSlashIcon className="h-4 w-4 text-yellow-400 cursor-pointer hover:text-yellow-300 transition-colors duration-200" />}
      </div>
    </div>
  );
};

export default DetailedInfo;
