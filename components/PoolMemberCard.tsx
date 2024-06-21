import React from 'react';
import Image from 'next/image';

interface PoolMemberCardProps {
  marketIcon: string;
  market: string;
  totalValueLocked: string;
  volume24hr: string;
  fees24hr: string;
  apr: string;
  utilization: string;
  riskScore: string;
}

const PoolMemberCard: React.FC<PoolMemberCardProps> = ({
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
    <div className="bg-white p-4 rounded-lg shadow-md mb-4">
      <div className="flex items-center mb-4">
        <Image src={marketIcon} alt={market} width={24} height={24} className="mr-4" />
        <h3 className="text-lg font-bold">{market}</h3>
      </div>
      <div className="flex justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium">Total Value Locked</span>
          <span className="text-lg font-bold">{totalValueLocked}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Volume (24hr)</span>
          <span className="text-lg font-bold">{volume24hr}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Fees (24hr)</span>
          <span className="text-lg font-bold">{fees24hr}</span>
        </div>
      </div>
      <div className="flex justify-between mb-4">
        <div className="flex flex-col">
          <span className="text-sm font-medium">APR</span>
          <span className="text-lg font-bold">{apr}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Utilization</span>
          <span className="text-lg font-bold">{utilization}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium">Risk Score</span>
          <span className="text-lg font-bold">{riskScore}</span>
        </div>
      </div>
    </div>
  );
};

export default PoolMemberCard;
