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

  // Define common class names
  const cardTextClass = "flex justify-between text-gray-900 dark:text-gray-100";

  return (
    <div className="relative bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-md mb-16 mx-auto min-w-[320px] max-w-xs sm:max-w-full">
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex justify-center w-full">
        <Image src={marketIcon} alt={market} width={128} height={128} className="h-32 w-32 object-contain" />
      </div>
      <div className="flex flex-col items-center mb-4 pt-8 px-8">
        <div className="text-center mb-2">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">{market}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Soroswap</p>
        </div>
      </div>
      <div className="flex flex-col space-y-2 px-8 pb-8">
        <div className={cardTextClass}>
          <span className="font-medium">TVL:</span>
          <span>{totalValueLocked}</span>
        </div>
        <div className={cardTextClass}>
          <span className="font-medium">Volume:</span>
          <span>{volume}</span>
        </div>
        <div className={cardTextClass}>
          <span className="font-medium">Fees:</span>
          <span>{fees}</span>
        </div>
        <div className={cardTextClass}>
          <span className="font-medium">APR:</span>
          <span className="text-green-500 dark:text-green-400">{apr}</span>
        </div>
        <div className={cardTextClass}>
          <span className="font-medium">Trending APR:</span>
          <span className={isTrendingUp ? "text-green-500 dark:text-green-400" : "text-red-500 dark:text-red-400"}>{trendingapr}</span>
        </div>
        <div className={cardTextClass}>
          <span className="font-medium">Utilization:</span>
          <span>{utilization}</span>
        </div>
        <div className={cardTextClass}>
          <span className="font-medium">Risk Score:</span>
          <span>{riskScore}</span>
        </div>
      </div>
    </div>
  );
};

export default DataCard;
