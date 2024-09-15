import React from 'react';

interface MarketCardProps {
  marketName: string;
  pairCount: number;
  totalValueLocked: string;
}

const MarketCard: React.FC<MarketCardProps> = ({
  marketName,
  pairCount,
  totalValueLocked,
}) => {
  return (
    <div className="relative bg-white p-4 rounded-32px shadow-custom mb-16 mx-auto min-w-[320px] max-w-xs sm:max-w-full sm:w-[calc(100%-32px)]">
      <div className="flex flex-col items-center mb-4">
        <div className="text-center mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{marketName}</h3>
        </div>
      </div>
      <div className="flex flex-col space-y-2 text-gray-900 px-8 pb-8">
        <div className="flex justify-between">
          <span className="font-medium">Pairs Count:</span>
          <span>{pairCount}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Total Value Locked (TVL):</span>
          <span>{totalValueLocked}</span>
        </div>
      </div>
    </div>
  );
};

export default MarketCard;
