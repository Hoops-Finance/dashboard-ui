"use client";

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Button, Card } from '../ui';

export function WalletConnection() {
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <Card className="p-6 transition-all duration-300 hover:shadow-xl">
      <div className="flex flex-col items-center space-y-4">
        <Button 
          className="bg-[#e2be08] hover:bg-[#c7a707] text-white px-8 py-3 transition-all duration-300 transform hover:scale-105"
          onClick={() => setWalletConnected(!walletConnected)}
        >
          <Wallet className="inline-block mr-2 h-4 w-4" />
          {walletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
        </Button>
        <div className="text-center">
          <p className="text-gray-600">Balance: {walletConnected ? '1000 ETH' : '---'}</p>
          <p className="text-gray-600">Saved: {walletConnected ? '500 ETH' : '---'}</p>
        </div>
      </div>
    </Card>
  );
}
