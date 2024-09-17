"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const ManageLiquidity: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"deposit" | "withdraw">("deposit");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [amount, setAmount] = useState("");
  const [slippageTolerance, setSlippageTolerance] = useState(0.5);

  return (
    <div className="w-full p-6 bg-white rounded-lg shadow-lg">
      {/* Header */}
      <h1 className="text-xl font-bold text-gray-800 mb-4">Manage Liquidity</h1>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        <button onClick={() => setActiveTab("deposit")} className={`flex-1 text-center py-2 ${activeTab === "deposit" ? "border-b-2 border-[#FFB734] text-[#FFB734]" : "text-gray-600"}`}>
          Deposit
        </button>
        <button onClick={() => setActiveTab("withdraw")} className={`flex-1 text-center py-2 ${activeTab === "withdraw" ? "border-b-2 border-[#FFB734] text-[#FFB734]" : "text-gray-600"}`}>
          Withdraw
        </button>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#FFB734]"
          />
          <div className="flex justify-end mt-1">
            <button className="text-sm text-[#FFB734] hover:text-[#E6A52F]" onClick={() => setAmount("100")}>
              Max
            </button>
          </div>
        </div>

        {/* Advanced Options */}
        <div>
          <button
            className="w-full py-2 bg-white text-gray-500 rounded-lg font-semibold border-2 border-gray-200 hover:bg-gray-100 transition-colors flex items-center justify-center"
            onClick={() => setShowAdvanced(!showAdvanced)}
          >
            Advanced Options
            {showAdvanced ? <ChevronUp className="ml-2" size={20} /> : <ChevronDown className="ml-2" size={20} />}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 p-4 bg-gray-100 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slippage Tolerance</label>
                <input type="range" min="0" max="5" step="0.1" value={slippageTolerance} onChange={(e) => setSlippageTolerance(parseFloat(e.target.value))} className="w-full" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0%</span>
                  <span>{slippageTolerance}%</span>
                  <span>5%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button className="w-full py-3 bg-[#FFB734] text-black rounded-lg font-semibold hover:bg-[#E6A52F] transition-colors">{activeTab === "deposit" ? "Deposit" : "Withdraw"}</button>

        {/* Liquidity Token Balance */}
        <div className="mt-4 bg-gray-100 p-4 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-2">Your Liquidity</h3>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">LP Token Balance:</span>
            <span className="text-gray-800">1,234.56 LP</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-700">Your Pool Share:</span>
            <span className="text-gray-800">12.34%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageLiquidity;
