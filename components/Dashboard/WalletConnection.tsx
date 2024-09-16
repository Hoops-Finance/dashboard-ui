"use client";

import { Card } from '../ui';
import { ConnectWallet } from '../ConnectWallet';
import { useWallet } from '../WalletContext';

export function WalletConnection() {
  const { isConnected, address, balance } = useWallet();

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
  };

  return (
    <Card className="p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex justify-between items-center">
        {isConnected ? (
          <div className="text-green-600 font-semibold">
            Welcome!
          </div>
        ) : (
          <ConnectWallet />
        )}
        <div className="text-right">
          <p className="text-gray-600">Balance: {isConnected ? `${parseFloat(balance!).toFixed(2)} XLM` : '---'}</p>
          <p className="text-gray-600">Address: {isConnected ? truncateAddress(address!) : '---'}</p>
        </div>
      </div>
    </Card>
  );
}
