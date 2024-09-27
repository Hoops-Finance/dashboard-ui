import React from "react";
import { Card } from "../ui";

interface MetricsProps {
  totalTVL: number;
  totalTokens: number;
  totalPools: number;
  totalProtocols: number; // New prop for protocols count
}

export function Metrics({ totalTVL, totalTokens, totalPools, totalProtocols }: MetricsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-4 transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800">
        <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1">TVL</h3>
        <p className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">{totalTVL ? `$${totalTVL.toLocaleString()}` : "$0"}</p>
      </Card>

      <Card className="p-4 transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800">
        <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1">Tokens</h3>
        <p className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">{totalTokens}</p>
      </Card>

      <Card className="p-4 transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800">
        <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1">Pools</h3>
        <p className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">{totalPools}</p>
      </Card>

      <Card className="p-4 transition-all duration-300 hover:shadow-xl bg-white dark:bg-gray-800">
        <h3 className="text-lg font-bold text-gray-500 dark:text-gray-400 mb-1">Protocols</h3>
        <p className="text-2xl font-bold text-center text-gray-800 dark:text-gray-100">{totalProtocols}</p>
      </Card>
    </div>
  );
}
