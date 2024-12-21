// /components/Swap.tsx

"use client";

import { useState } from "react";
import { ArrowsUpDownIcon, InformationCircleIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { Address } from "@stellar/stellar-sdk";

export interface TokenSwapInfo {
  tokenAddress: Address;
  symbol: string;
  name: string;
  icon: string;
  Markets: TokenMarket[];
}

export interface TokenMarket {
  token0: Address;
  token1: Address;
  pairs: SwapPairInfo[];
}

export interface SwapPairInfo {
  pairAddress: Address;
  protocol: "aqua" | "soroswap" | "phoenix" | "comet" | string;
}

export interface SwapComponentProps {
  inToken: TokenSwapInfo;
  outToken: TokenSwapInfo;
  pair: SwapPairInfo;
  inAmount: number;
}

const tokens = [
  { symbol: "XLM", name: "Stellar Lumens", icon: "/icons/tokens/xlm.png?height=32&width=32" },
  { symbol: "USDC", name: "USD Coin", icon: "/icons/tokens/usdc.png?height=32&width=32" },
  { symbol: "EURC", name: "Euro Coin", icon: "/icons/tokens/eurc.jpg?height=32&width=32" },
  { symbol: "AQUA", name: "Aquarious", icon: "/icons/tokens/aqua.jpg?height=32&width=32" },
  { symbol: "XTAR", name: "DogStar", icon: "/icons/tokens/xtar.png?height=32&width=32" }
];

export default function SwapComponent() {
  const [payToken, setPayToken] = useState(tokens[0]);
  const [receiveToken, setReceiveToken] = useState(tokens[1]);
  const [payDropdownOpen, setPayDropdownOpen] = useState(false);
  const [receiveDropdownOpen, setReceiveDropdownOpen] = useState(false);
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);
  const [customFee, setCustomFee] = useState("");
  /*
  // Handle swapping tokens
  const handleSwapTokens = () => {
    setPayToken(receiveToken);
    setReceiveToken(payToken);
  };
*/
  return (
    <div className="w-full max-w-md p-6 card-base">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary">Swap</h1>
        <button className="text-gray-500 hover:text-gray-700">
          {/* Settings Icon */}
          <svg width="24" height="24" fill="currentColor">
            {/* SVG content */}
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09a1.65 1.65 0 0 0 1.51-1 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33h.09a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82v.09a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {/* Pay Section */}
        <div>
          <div className="flex justify-between text-sm text-secondary mb-2">
            <span>Pay</span>
            <span>Balance: 100.00 {payToken.symbol}</span>
          </div>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center flex-1">
              <div className="relative">
                <button
                  onClick={() => setPayDropdownOpen(!payDropdownOpen)}
                  className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full py-1 px-2 mr-2"
                >
                  <Image src={payToken.icon} alt={payToken.name} width={24} height={24} className="rounded-full mr-1" />
                  <span className="text-primary mr-1">{payToken.symbol}</span>
                  <ChevronDownIcon className="text-gray-500" />
                </button>
                {payDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
                    {tokens.map((token) => (
                      <button
                        key={token.symbol}
                        className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          setPayToken(token);
                          setPayDropdownOpen(false);
                        }}
                      >
                        <Image src={token.icon} alt={token.name} width={24} height={24} className="rounded-full mr-2" />
                        <span className="text-primary">{token.symbol}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input type="number" className="bg-transparent text-primary text-right flex-1 focus:outline-none" placeholder="0" defaultValue="50.00" />
            </div>
            <button className="ml-2 px-3 py-1 bg-gray-200 dark:bg-gray-600 text-primary text-sm rounded-full hover:bg-gray-300 dark:hover:bg-gray-500">Max</button>
          </div>
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button className="bg-gray-200 dark:bg-gray-600 p-2 rounded-full">
            <ArrowsUpDownIcon className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Receive Section */}
        <div>
          <div className="flex justify-between text-sm text-secondary mb-2">
            <span>Receive</span>
            <span>Balance: 1000.00 {receiveToken.symbol}</span>
          </div>
          <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-3">
            <div className="flex items-center flex-1">
              <div className="relative">
                <button
                  onClick={() => setReceiveDropdownOpen(!receiveDropdownOpen)}
                  className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-full py-1 px-2 mr-2"
                >
                  <Image src={receiveToken.icon} alt={receiveToken.name} width={24} height={24} className="rounded-full mr-1" />
                  <span className="text-primary mr-1">{receiveToken.symbol}</span>
                  <ChevronDownIcon className="text-gray-500" />
                </button>
                {receiveDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg z-10">
                    {tokens.map((token) => (
                      <button
                        key={token.symbol}
                        className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => {
                          setReceiveToken(token);
                          setReceiveDropdownOpen(false);
                        }}
                      >
                        <Image src={token.icon} alt={token.name} width={24} height={24} className="rounded-full mr-2" />
                        <span className="text-primary">{token.symbol}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <input type="number" className="bg-transparent text-primary text-right flex-1 focus:outline-none" placeholder="0" defaultValue="25.00" readOnly />
            </div>
          </div>
        </div>

        {/* Price InformationCircleIcon */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-secondary">Price</span>
          <span className="text-primary">
            1 {payToken.symbol} = 0.5 {receiveToken.symbol} ($0.25)
          </span>
          <InformationCircleIcon className="text-gray-500" />
        </div>

        {/* Swap Button */}
        <button className="w-full py-3 button-primary mb-4">Swap</button>

        {/* Advanced Options Toggle */}
        <div className="mb-4">
          <button
            className="w-full py-2 bg-white dark:bg-gray-800 text-secondary rounded-lg font-semibold border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
            onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
          >
            Advanced Options
            {advancedOptionsOpen ? <ChevronUpIcon className="ml-2" /> : <ChevronDownIcon className="ml-2" />}
          </button>
        </div>

        {/* Advanced Options */}
        {advancedOptionsOpen && (
          <div className="space-y-4 mb-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Slippage Tolerance</label>
              <input type="range" min="0" max="5" step="0.1" value={slippageTolerance} onChange={(e) => setSlippageTolerance(parseFloat(e.target.value))} className="w-full" />
              <div className="flex justify-between text-sm text-secondary">
                <span>0%</span>
                <span>{slippageTolerance}%</span>
                <span>5%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-secondary mb-1">Custom Fee</label>
              <input
                type="text"
                value={customFee}
                onChange={(e) => setCustomFee(e.target.value)}
                placeholder="Enter custom fee"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e2be08] bg-white dark:bg-gray-800 text-primary"
              />
            </div>
          </div>
        )}

        {/* Transaction Overview */}
        <div className="space-y-2 text-sm bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="font-semibold text-primary mb-2">Transaction Overview</h3>
          <div className="flex justify-between">
            <span className="text-secondary">Slippage Tolerance:</span>
            <span className="text-primary">
              {slippageTolerance}% <InformationCircleIcon className="inline text-gray-600" />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Minimum received:</span>
            <span className="text-primary">
              24.88 {receiveToken.symbol} <InformationCircleIcon className="inline text-gray-600" />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Price Impact:</span>
            <span className="text-primary">
              {"< 0.01%"} <InformationCircleIcon className="inline text-gray-600" />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Network Fee:</span>
            <span className="text-primary">
              0.00001 XLM <InformationCircleIcon className="inline text-gray-600" />
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-secondary">Exchange Fee:</span>
            <span className="text-primary">
              Free <InformationCircleIcon className="inline text-gray-600" />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/*
const InfoCard: FC<InfoCardProps> = ({ title, value }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <p className="text-xl font-bold text-gray-800">{value}</p>
  </div>
);
*/

/*
const ReserveCard: FC<ReserveCardProps> = ({ title, token, reserve, usdValue }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <p className="text-xs text-gray-400 break-all">{token}</p>
    <p className="text-lg font-bold text-gray-800 mt-1">Reserve: {new Intl.NumberFormat("en-US").format(reserve)}</p>
    <p className="text-sm text-gray-600">USD Value: ${usdValue.toFixed(2)}</p>
  </div>
);
*/
/*
const ContractCard: FC<ContractCardProps> = ({ title, address }) => (
  <div className="bg-gray-50 p-4 rounded-lg">
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-800">{address ? `${address.slice(0, 8)}...${address.slice(-8)}` : "Address not available"}</p>
      {address && <LinkSlashIcon className="h-4 w-4 text-[#FFB734] cursor-pointer hover:text-[#E6A52F] transition-colors duration-200" />}
    </div>
  </div>
);
*/
//export default SwapComponent;
