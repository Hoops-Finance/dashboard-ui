"use client";

import { useState } from "react";
import { Card } from "../ui";
import { ConnectWallet } from "../ConnectWallet";
import { useWallet } from "../WalletContext";
import { ClipboardCopyIcon } from "@heroicons/react/outline";
export function WalletConnection() {
  const { isConnected, address, balance } = useWallet();
  const [showMessage, setShowMessage] = useState(false);

  const truncateAddress = (addr: string) => `${addr.slice(0, 4)}...${addr.slice(-4)}`;

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000); // Hide message after 2 seconds
    }
  };

  return (
    <div className="card-base">
      <div className="flex justify-between items-start">
        {isConnected ? <div className="text-green-600 font-semibold">Welcome!</div> : <ConnectWallet />}
        <div className="text-right">
          <p className="text-gray-600 dark:text-gray-400 mb-2">Balance: {isConnected ? `${parseFloat(balance!).toFixed(2)} XLM` : "---"}</p>
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <p className="text-gray-600 dark:text-gray-400 mr-2">Address: {isConnected ? truncateAddress(address!) : "---"}</p>
              {isConnected && (
                <button onClick={copyToClipboard} className="text-gray-400 hover:text-gray-600">
                  <ClipboardCopyIcon />
                </button>
              )}
            </div>
            {showMessage && <p className="text-sm text-green-600 mt-1">Public Address saved to clipboard</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
