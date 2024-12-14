"use client";

import { WalletProvider } from '../contexts/WalletContext';
import { ReactNode } from 'react';

export const ClientWalletProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return <WalletProvider>{children}</WalletProvider>;
};