// /components/Swap.tsx
"use client";

import { useState } from "react";
import {
  ArrowsUpDownIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import { type Address } from "@stellar/stellar-sdk/minimal";

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
  protocol: "aqua" | "soroswap" | "phoenix" | "comet";
}

export interface SwapComponentProps {
  inToken: TokenSwapInfo;
  outToken: TokenSwapInfo;
  pair: SwapPairInfo;
  inAmount: number;
}

const tokens = [
  {
    symbol: "XLM",
    name: "Stellar Lumens",
    icon: "/icons/tokens/xlm.png?height=32&width=32",
  },
  {
    symbol: "USDC",
    name: "USD Coin",
    icon: "/icons/tokens/usdc.png?height=32&width=32",
  },
  {
    symbol: "EURC",
    name: "Euro Coin",
    icon: "/icons/tokens/eurc.jpg?height=32&width=32",
  },
  {
    symbol: "AQUA",
    name: "Aquarious",
    icon: "/icons/tokens/aqua.jpg?height=32&width=32",
  },
  {
    symbol: "XTAR",
    name: "DogStar",
    icon: "/icons/tokens/xtar.png?height=32&width=32",
  },
];

export default function SwapComponent() {
  const [payToken, setPayToken] = useState(tokens[0]);
  const [receiveToken, setReceiveToken] = useState(tokens[1]);
  const [payDropdownOpen, setPayDropdownOpen] = useState(false);
  const [receiveDropdownOpen, setReceiveDropdownOpen] = useState(false);
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);

  return (
    <div className="bg-background text-foreground min-h-screen flex items-center justify-center p-4">
      {/* Swap card container */}
      <div className="w-full max-w-md p-6 card-base text-foreground">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Swap</h1>
        </div>

        <div className="space-y-4">
          {/* Pay Section */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Pay</span>
              <span>Balance: 100.00 {payToken.symbol}</span>
            </div>
            <div className="flex items-center bg-input rounded-lg p-3">
              <div className="flex items-center flex-1">
                <div className="relative">
                  <button
                    onClick={() => setPayDropdownOpen(!payDropdownOpen)}
                    className="flex items-center bg-background border border-input rounded-full py-1 px-2 mr-2"
                  >
                    <Image
                      src={payToken.icon}
                      alt={payToken.name}
                      width={24}
                      height={24}
                      className="rounded-full mr-1"
                    />
                    <span className="mr-1">{payToken.symbol}</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  {payDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 rounded-lg shadow-lg bg-card z-10">
                      {tokens.map((token) => (
                        <button
                          key={token.symbol}
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-muted"
                          onClick={() => {
                            setPayToken(token);
                            setPayDropdownOpen(false);
                          }}
                        >
                          <Image
                            src={token.icon}
                            alt={token.name}
                            width={24}
                            height={24}
                            className="rounded-full mr-2"
                          />
                          <span>{token.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  className="bg-transparent text-right flex-1 focus:outline-none"
                  placeholder="0"
                  defaultValue="50.00"
                />
              </div>
              <button className="ml-2 px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full hover:bg-secondary/80">
                Max
              </button>
            </div>
          </div>

          {/* Swap Icon Button */}
          <div className="flex justify-center">
            <button className="bg-secondary p-2 rounded-full hover:bg-secondary/80">
              <ArrowsUpDownIcon className="w-5 h-5 text-secondary-foreground" />
            </button>
          </div>

          {/* Receive Section */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Receive</span>
              <span>Balance: 1000.00 {receiveToken.symbol}</span>
            </div>
            <div className="flex items-center bg-input rounded-lg p-3">
              <div className="flex items-center flex-1">
                <div className="relative">
                  <button
                    onClick={() =>
                      setReceiveDropdownOpen(!receiveDropdownOpen)
                    }
                    className="flex items-center bg-background border border-input rounded-full py-1 px-2 mr-2"
                  >
                    <Image
                      src={receiveToken.icon}
                      alt={receiveToken.name}
                      width={24}
                      height={24}
                      className="rounded-full mr-1"
                    />
                    <span className="mr-1">{receiveToken.symbol}</span>
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                  {receiveDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 rounded-lg shadow-lg bg-card z-10">
                      {tokens.map((token) => (
                        <button
                          key={token.symbol}
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-muted"
                          onClick={() => {
                            setReceiveToken(token);
                            setReceiveDropdownOpen(false);
                          }}
                        >
                          <Image
                            src={token.icon}
                            alt={token.name}
                            width={24}
                            height={24}
                            className="rounded-full mr-2"
                          />
                          <span>{token.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  className="bg-transparent text-right flex-1 focus:outline-none"
                  placeholder="0"
                  defaultValue="25.00"
                  readOnly
                />
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="text-sm">
            1 {payToken.symbol} = 0.5 {receiveToken.symbol} ($0.25)
          </div>

          {/* Slippage Tolerance */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Slippage Tolerance
            </label>
            <input
              type="range"
              min="0"
              max="5"
              step="0.1"
              value={slippageTolerance}
              onChange={(e) => setSlippageTolerance(parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm">
              <span>0%</span>
              <span>{slippageTolerance}%</span>
              <span>5%</span>
            </div>
          </div>

          {/* Main Swap Button */}
          <div className="flex justify-center">
            <button className="mt-2 px-6 py-3 button-primary">Swap</button>
          </div>

          {/* Transaction Overview */}
          <div className="mt-4 p-4 rounded-lg bg-muted">
            <h3 className="font-semibold mb-2 text-lg">Transaction Overview</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Slippage Tolerance:</span>
                <span>{slippageTolerance}%</span>
              </div>
              <div className="flex justify-between">
                <span>Minimum Received:</span>
                <span>24.88 {receiveToken.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span>Price Impact:</span>
                <span>&lt; 0.01%</span>
              </div>
              <div className="flex justify-between">
                <span>Network Fee:</span>
                <span>0.00001 XLM</span>
              </div>
              <div className="flex justify-between">
                <span>Exchange Fee:</span>
                <span>Free</span>
              </div>
            </div>
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
