"use client";

import React, { createContext, useState, useContext, ReactNode } from 'react';

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  updateWalletInfo: (isConnected: boolean, address: string | null, balance: string | null) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);

  const updateWalletInfo = (isConnected: boolean, address: string | null, balance: string | null) => {
    setIsConnected(isConnected);
    setAddress(address);
    setBalance(balance);
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, balance, updateWalletInfo }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};