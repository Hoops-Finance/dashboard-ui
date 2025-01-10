"use client";

import { WalletProvider } from "@/contexts/WalletContext";
import { ReactNode, FC } from "react";

export const ClientWalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
  return <WalletProvider>{children}</WalletProvider>;
};
