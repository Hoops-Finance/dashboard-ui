"use client";

import { useState } from 'react';
import { Card } from '../ui';
import { ConnectWallet } from '../ConnectWallet';
import { useWallet } from '../WalletContext';
import { Clipboard } from 'lucide-react';

export function WalletConnection() {
  const { isConnected, address, balance } = useWallet();
  const [showMessage, setShowMessage] = useState(false);

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  const copyToClipboard = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000); // Hide message after 2 seconds
    }
  };

  return (
    <Card className="p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-start">
        {isConnected ? (
          <div className="text-green-600 font-semibold">
            Welcome!
          </div>
        ) : (
          <ConnectWallet />
        )}
        <div className="text-right">
          <p className="text-gray-600 mb-2">Balance: {isConnected ? `${parseFloat(balance!).toFixed(2)} XLM` : '---'}</p>
          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <p className="text-gray-600 mr-2">Address: {isConnected ? truncateAddress(address!) : '---'}</p>
              {isConnected && (
                <button onClick={copyToClipboard} className="text-gray-400 hover:text-gray-600">
                  <Clipboard size={16} />
                </button>
              )}
            </div>
            {showMessage && (
              <p className="text-sm text-green-600 mt-1">Public Address saved to clipboard</p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
