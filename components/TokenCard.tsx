import React from 'react';

interface TokenCardProps {
  tokenName: string;
  tokenSymbol: string;
  totalValueLocked: string;
}

const TokenCard: React.FC<TokenCardProps> = ({
  tokenName,
  tokenSymbol,
  totalValueLocked,
}) => {
  return (
    <div className="relative bg-white p-4 rounded-32px shadow-custom mb-16 mx-auto min-w-[320px] max-w-xs sm:max-w-full sm:w-[calc(100%-32px)]">
      <div className="flex flex-col items-center mb-4">
        <div className="text-center mb-2">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{tokenName}</h3>
          <p className="text-sm text-gray-500">{tokenSymbol}</p>
        </div>
      </div>
      <div className="flex flex-col space-y-2 text-gray-900 px-8 pb-8">
        <div className="flex justify-between">
          <span className="font-medium">Total Value Locked (TVL):</span>
          <span>{totalValueLocked}</span>
        </div>
      </div>
    </div>
  );
};

export default TokenCard;
