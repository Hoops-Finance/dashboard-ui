"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUpDown, ExternalLink, Info } from 'lucide-react';

interface PoolData {
  protocol: string;
  tvl: number;
  lptSupply: number;
  dailyVolume: number;
  liquidityUtilization: number;
  fee: number;
  apr: number;
  token0: string;
  token1: string;
  reserve0: number;
  reserve1: number;
  t0usd: number;
  t1usd: number;
  _id: string;
  lptoken: string;
  lastUpdated: string;
}

// Dummy data related to Stellar blockchain
const dummyPoolData: PoolData = {
  protocol: "Stellar",
  tvl: 15000000,
  lptSupply: 10000000,
  dailyVolume: 500000,
  liquidityUtilization: 75,
  fee: 0.3,
  apr: 8.5,
  token0: "XLM",
  token1: "USDC",
  reserve0: 7500000,
  reserve1: 7500000,
  t0usd: 0.1,
  t1usd: 1,
  _id: "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  lptoken: "LXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  lastUpdated: new Date().toISOString()
};

const PoolInfo: React.FC<{ poolData?: PoolData }> = ({ poolData = dummyPoolData }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [clientSideDate, setClientSideDate] = useState<string | null>(null);

  // Use useEffect to set the date on the client side
  useEffect(() => {
    setClientSideDate(new Date(poolData.lastUpdated).toLocaleString());
  }, [poolData.lastUpdated]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(num);
  };

  const formatPercentage = (num: number): string => {
    return new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 2 }).format(num / 100);
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">{poolData.protocol} USD Pool</h2>
          <div className="flex space-x-2">
            {['Deposit', 'Withdraw/Claim', 'Swap'].map((action) => (
              <button
                key={action}
                className="bg-[#FFB734] hover:bg-[#E6A52F] text-black px-3 py-1 rounded-md text-sm font-medium transition-colors duration-200"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <InfoCard title="TVL" value={formatCurrency(poolData.tvl)} />
          <InfoCard title="LP Token Supply" value={formatNumber(poolData.lptSupply)} />
          <InfoCard title="Daily USD volume" value={formatCurrency(poolData.dailyVolume)} />
          <InfoCard title="Liquidity utilization" value={formatPercentage(poolData.liquidityUtilization)} />
          <InfoCard title="Fee" value={formatPercentage(poolData.fee)} />
          <InfoCard title="APR" value={formatPercentage(poolData.apr)} />
        </div>

        <div className="mt-6">
          <button
            className="flex items-center text-[#FFB734] hover:text-[#E6A52F] transition-colors duration-200"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Hide' : 'Show'} Currency Reserves
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </button>
        </div>

        {isExpanded && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <ReserveCard title="Token 0" token={poolData.token0} reserve={poolData.reserve0} usdValue={poolData.t0usd} />
            <ReserveCard title="Token 1" token={poolData.token1} reserve={poolData.reserve1} usdValue={poolData.t1usd} />
            <ReserveCard
              title="Total Reserve (USD)"
              token="Combined"
              reserve={poolData.reserve0 * poolData.t0usd + poolData.reserve1 * poolData.t1usd}
              usdValue={poolData.reserve0 * poolData.t0usd + poolData.reserve1 * poolData.t1usd}
            />
          </div>
        )}

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Contracts</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ContractCard title="Pool" address={poolData._id} />
            <ContractCard title="LP Token" address={poolData.lptoken} />
          </div>
        </div>

        <div className="mt-6 flex items-center text-sm text-gray-500">
          <Info className="h-4 w-4 mr-2" />
          Last updated: {clientSideDate || 'Loading...'}
        </div>
      </div>
    </div>
  );
};

interface InfoCardProps {
  title: string;
  value: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <p className="text-xl font-bold text-gray-800">{value}</p>
  </div>
);

interface ReserveCardProps {
  title: string;
  token: string;
  reserve: number;
  usdValue: number;
}

const ReserveCard: React.FC<ReserveCardProps> = ({ title, token, reserve, usdValue }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <p className="text-xs text-gray-400 break-all">{token}</p>
    <p className="text-lg font-bold text-gray-800 mt-1">Reserve: {new Intl.NumberFormat('en-US').format(reserve)}</p>
    <p className="text-sm text-gray-600">USD Value: ${usdValue.toFixed(7)}</p>
  </div>
);

interface ContractCardProps {
  title: string;
  address: string;
}

const ContractCard: React.FC<ContractCardProps> = ({ title, address }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-800">
        {address ? `${address.slice(0, 8)}...${address.slice(-8)}` : 'Address not available'}
      </p>
      {address && (
        <ExternalLink className="h-4 w-4 text-[#FFB734] cursor-pointer hover:text-[#E6A52F] transition-colors duration-200" />
      )}
    </div>
  </div>
);

export default PoolInfo;