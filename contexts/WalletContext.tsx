"use client";

import { createContext, useState, useContext, ReactNode, FC } from "react";
import { WalletContextType, BalanceLineAsset, BalanceLineLiquidityPool } from "@/utils/newTypes";

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [otherBalances, setOtherBalances] = useState<(BalanceLineAsset<"credit_alphanum4" | "credit_alphanum12"> | BalanceLineLiquidityPool)[] | null>(null);

  const updateWalletInfo = (isConnected: boolean, address: string | null, balance: string | null, otherBalances: (BalanceLineAsset<"credit_alphanum4" | "credit_alphanum12"> | BalanceLineLiquidityPool)[] | null) => {
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
