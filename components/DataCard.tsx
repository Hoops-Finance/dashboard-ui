// ./components/DataCard.tsx

import React from "react";
import Image from "next/image";

interface DataCardProps {
  marketIcon: string;
  market: string;
  totalValueLocked: string;
  volume: string;
  fees: string;
  apr: string;
  trendingapr: string;
  utilization: string;
  riskScore: string;
}

const DataCard: React.FC<DataCardProps> = ({ marketIcon, market, totalValueLocked, volume, fees, apr, trendingapr, utilization, riskScore }) => {
  const isTrendingUp = parseFloat(trendingapr) > parseFloat(apr);

  return (
    <div className="relative bg-white p-4 rounded-32px shadow-custom mb-16 mx-auto min-w-[320px] max-w-xs sm:max-w-full sm:w-[calc(100%-32px)]" style={{ paddingBottom: "16px" }}>
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex justify-center w-full">
        <Image id="pairImage" src={marketIcon} alt={market} width={128} height={128} className="h-32 w-32 object-contain" />
      </div>
      <div className="flex flex-col items-center mb-4 pt-8 px-8">
        <div className="text-center mb-2">
          <h3 id="pairName" className="text-lg font-bold text-gray-900 mb-2">
            {market}
          </h3>
          <p id="protocol" className="text-sm text-gray-500">
            Soroswap
          </p>
        </div>
      </div>
      <div className="flex flex-col space-y-2 text-gray-900 px-8 pb-8">
        <div className="flex justify-between">
          <span className="font-medium">TVL:</span>
          <span id="totalValueLocked">{totalValueLocked}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Volume:</span>
          <span id="volume">{volume}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Fees:</span>
          <span id="fees">{fees}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">APR:</span>
          <span id="apr" className="text-green-500">
            {apr}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Trending APR:</span>
          <span id="trendingapr" className={isTrendingUp ? "text-green-500" : "text-red-500"}>
            {trendingapr}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Utilization:</span>
          <span id="utilization">{utilization}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Risk Score:</span>
          <span id="riskScore">{riskScore}</span>
        </div>
      </div>
    </div>
  );
};

export default DataCard;
