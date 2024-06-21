import React from 'react';

interface DataCardProps {
  marketIcon: string;
  market: string;
  totalValueLocked: string;
  volume24hr: string;
  fees24hr: string;
  apr: string;
  utilization: string;
  riskScore: string;
}

const DataCard: React.FC<DataCardProps> = ({
  marketIcon,
  market,
  totalValueLocked,
  volume24hr,
  fees24hr,
  apr,
  utilization,
  riskScore,
}) => {
  return (
    <div className="relative bg-white p-4 rounded-32px shadow-custom mt-8 mb-16 pb-8 mx-8 max-w-screen-lg">
      <div className="absolute -top-16 left-1/2 transform -translate-x-1/2 flex justify-center w-full">
        <img src={marketIcon} alt={market} className="h-32 w-32 object-contain" />
      </div>
      <div className="flex flex-col items-center mb-4 pt-8 px-8">
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-900">{market}</h3>
          <p className="text-sm text-gray-500">Soroswap</p>
        </div>
      </div>
      <div className="flex flex-col space-y-2 text-gray-900 px-8">
        <div className="flex justify-between">
          <span className="font-medium">TVL:</span>
          <span>{totalValueLocked}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Volume (24hr):</span>
          <span>{volume24hr}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Fees (24 hr):</span>
          <span>{fees24hr}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">APR:</span>
          <span className="text-green-500">{apr}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Utilization:</span>
          <span>{utilization}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Risk Score:</span>
          <span>{riskScore}</span>
        </div>
      </div>
    </div>
  );
};

export default DataCard;