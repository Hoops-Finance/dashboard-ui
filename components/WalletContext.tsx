"use client";

import React, { createContext, useState, useContext, ReactNode } from "react";
import { HorizonApi } from "@stellar/stellar-sdk/lib/horizon";

interface WalletContextType {
  isConnected: boolean;
  address: string | null;
  balance: string | null;
  otherBalances: (HorizonApi.BalanceLineAsset | HorizonApi.BalanceLineLiquidityPool)[] | null;
  updateWalletInfo: (isConnected: boolean, address: string | null, balance: string | null, otherBalances: (HorizonApi.BalanceLineAsset | HorizonApi.BalanceLineLiquidityPool)[] | null) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [otherBalances, setOtherBalances] = useState<(HorizonApi.BalanceLineAsset | HorizonApi.BalanceLineLiquidityPool)[] | null>(null);

  const updateWalletInfo = (isConnected: boolean, address: string | null, balance: string | null, otherBalances: (HorizonApi.BalanceLineAsset | HorizonApi.BalanceLineLiquidityPool)[] | null) => {
    setIsConnected(isConnected);
    setAddress(address);
    setBalance(balance);
    setOtherBalances(otherBalances);
  };

  return <WalletContext.Provider value={{ isConnected, address, balance, otherBalances, updateWalletInfo }}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
};
