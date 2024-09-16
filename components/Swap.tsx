'use client'

import { useState } from 'react'
import { ArrowDownUp, ChevronDown, Info, ChevronUp } from 'lucide-react'
import Image from 'next/image'

const tokens = [
  { symbol: 'XLM', name: 'Stellar Lumens', icon: '/placeholder.svg?height=32&width=32' },
  { symbol: 'USDC', name: 'USD Coin', icon: '/placeholder.svg?height=32&width=32' },
  { symbol: 'BTC', name: 'Bitcoin', icon: '/placeholder.svg?height=32&width=32' },
  { symbol: 'ETH', name: 'Ethereum', icon: '/placeholder.svg?height=32&width=32' },
  { symbol: 'XRP', name: 'Ripple', icon: '/placeholder.svg?height=32&width=32' },
]

export default function SwapComponent() {
  const [payToken, setPayToken] = useState(tokens[0])
  const [receiveToken, setReceiveToken] = useState(tokens[1])
  const [payDropdownOpen, setPayDropdownOpen] = useState(false)
  const [receiveDropdownOpen, setReceiveDropdownOpen] = useState(false)
  const [advancedOptionsOpen, setAdvancedOptionsOpen] = useState(false)
  const [slippageTolerance, setSlippageTolerance] = useState(0.5)
  const [customFee, setCustomFee] = useState('')

  return (
    <div className="flex items-center justify-center min-h-screen bg-[url('/placeholder.svg?height=1080&width=1920')] bg-cover bg-center bg-no-repeat">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Swap</h1>
          <button className="text-gray-500 hover:text-gray-700">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3H7V7H3V3Z" fill="currentColor" />
              <path d="M10 3H14V7H10V3Z" fill="currentColor" />
              <path d="M17 3H21V7H17V3Z" fill="currentColor" />
              <path d="M3 10H7V14H3V10Z" fill="currentColor" />
              <path d="M10 10H14V14H10V10Z" fill="currentColor" />
              <path d="M17 10H21V14H17V10Z" fill="currentColor" />
              <path d="M3 17H7V21H3V17Z" fill="currentColor" />
              <path d="M10 17H14V21H10V17Z" fill="currentColor" />
              <path d="M17 17H21V21H17V17Z" fill="currentColor" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Pay</span>
              <span>Balance: 100.00 {payToken.symbol}</span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-3">
              <div className="flex items-center flex-1">
                <div className="relative">
                  <button
                    onClick={() => setPayDropdownOpen(!payDropdownOpen)}
                    className="flex items-center bg-white border border-gray-300 rounded-full py-1 px-2 mr-2"
                  >
                    <Image src={payToken.icon} alt={payToken.name} width={24} height={24} className="rounded-full mr-1" />
                    <span className="text-gray-800 mr-1">{payToken.symbol}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>
                  {payDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-10">
                      {tokens.map((token) => (
                        <button
                          key={token.symbol}
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => {
                            setPayToken(token)
                            setPayDropdownOpen(false)
                          }}
                        >
                          <Image src={token.icon} alt={token.name} width={24} height={24} className="rounded-full mr-2" />
                          <span className="text-gray-800">{token.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  className="bg-transparent text-gray-800 text-right flex-1 focus:outline-none"
                  placeholder="0"
                  defaultValue="50.00"
                />
              </div>
              <button className="ml-2 px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded-full hover:bg-gray-300">
                Max
              </button>
            </div>
          </div>

          <div className="flex justify-center">
            <button className="bg-gray-200 p-2 rounded-full">
              <ArrowDownUp className="text-gray-600" size={20} />
            </button>
          </div>

          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Receive</span>
              <span>Balance: 1000.00 {receiveToken.symbol}</span>
            </div>
            <div className="flex items-center bg-gray-100 rounded-lg p-3">
              <div className="flex items-center flex-1">
                <div className="relative">
                  <button
                    onClick={() => setReceiveDropdownOpen(!receiveDropdownOpen)}
                    className="flex items-center bg-white border border-gray-300 rounded-full py-1 px-2 mr-2"
                  >
                    <Image src={receiveToken.icon} alt={receiveToken.name} width={24} height={24} className="rounded-full mr-1" />
                    <span className="text-gray-800 mr-1">{receiveToken.symbol}</span>
                    <ChevronDown size={16} className="text-gray-500" />
                  </button>
                  {receiveDropdownOpen && (
                    <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-lg shadow-lg z-10">
                      {tokens.map((token) => (
                        <button
                          key={token.symbol}
                          className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100"
                          onClick={() => {
                            setReceiveToken(token)
                            setReceiveDropdownOpen(false)
                          }}
                        >
                          <Image src={token.icon} alt={token.name} width={24} height={24} className="rounded-full mr-2" />
                          <span className="text-gray-800">{token.symbol}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <input
                  type="number"
                  className="bg-transparent text-gray-800 text-right flex-1 focus:outline-none"
                  placeholder="0"
                  defaultValue="25.00"
                  readOnly
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-600">Price</span>
            <span className="text-gray-800">1 {payToken.symbol} = 0.5 {receiveToken.symbol} ($0.25)</span>
            <Info className="text-gray-500" size={16} />
          </div>

          <button className="w-full py-3 bg-[#e2be08] text-gray-900 rounded-lg font-semibold hover:bg-[#c7a707] transition-colors mb-4">
            Swap
          </button>

          <div className="mb-4">
            <button
              className="w-full py-2 bg-white text-gray-500 rounded-lg font-semibold border-2 border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center"
              onClick={() => setAdvancedOptionsOpen(!advancedOptionsOpen)}
            >
              Advanced Options
              {advancedOptionsOpen ? (
                <ChevronUp className="ml-2" size={20} />
              ) : (
                <ChevronDown className="ml-2" size={20} />
              )}
            </button>
          </div>

          {advancedOptionsOpen && (
            <div className="space-y-4 mb-4 p-4 bg-gray-100 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0%</span>
                  <span>{slippageTolerance}%</span>
                  <span>5%</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Fee
                </label>
                <input
                  type="text"
                  value={customFee}
                  onChange={(e) => setCustomFee(e.target.value)}
                  placeholder="Enter custom fee"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#e2be08]"
                />
              </div>
            </div>
          )}

          <div className="space-y-2 text-sm bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">Transaction Overview</h3>
            <div className="flex justify-between">
              <span className="text-gray-700">Slippage Tolerance:</span>
              <span className="text-gray-800">0.5% <Info className="inline text-gray-600" size={14} /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Minimum received:</span>
              <span className="text-gray-800">24.88 {receiveToken.symbol} <Info className="inline text-gray-600" size={14} /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Price Impact:</span>
              <span className="text-gray-800">{"< 0.01%"} <Info className="inline text-gray-600" size={14} /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Network Fee:</span>
              <span className="text-gray-800">0.00001 XLM <Info className="inline text-gray-600" size={14} /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-700">Exchange Fee:</span>
              <span className="text-gray-800">Free <Info className="inline text-gray-600" size={14} /></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}