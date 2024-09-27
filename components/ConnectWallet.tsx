"use client";

import { useState } from 'react';
import { Wallet } from 'lucide-react';
import { Button } from './ui';

export function ConnectWallet() {
  const [walletConnected, setWalletConnected] = useState(false);

  return (
    <Button 
      className="bg-[#e2be08] hover:bg-[#c7a707] text-white px-4 py-2 rounded-lg transition-all duration-300 transform hover:scale-105"
      onClick={() => setWalletConnected(!walletConnected)}
    >
      <Wallet className="inline-block mr-2 h-4 w-4" />
      {walletConnected ? 'Disconnect' : 'Connect Wallet'}
    </Button>
  );
}