"use client";

import React from 'react';
import { StellarWalletsKit, WalletNetwork, allowAllModules, XBULL_ID } from '@creit.tech/stellar-wallets-kit';
import { useWallet } from './WalletContext';

export const ConnectWallet: React.FC = () => {
  const { isConnected, updateWalletInfo } = useWallet();

  const connectWallet = async () => {
    const kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: XBULL_ID,
      modules: allowAllModules(),
    });

    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          
          try {
            // Use dynamic import for Stellar SDK
            const StellarSdk = await import('stellar-sdk');
            const server = new StellarSdk.default.Server('https://horizon-testnet.stellar.org');
            
            const account = await server.loadAccount(address);
            const xlmBalance = account.balances.find((b: any) => b.asset_type === 'native');
            const newBalance = xlmBalance ? xlmBalance.balance : '0';
            updateWalletInfo(true, address, newBalance);
          } catch (error) {
            console.error('Error loading account:', error);
            updateWalletInfo(true, address, '0');
          }
        },
      });
    } catch (error) {
      console.error('Error connecting wallet:', error);
    }
  };

  const disconnectWallet = async () => {
    updateWalletInfo(false, null, null);
  };

  return (
    <button
      onClick={isConnected ? disconnectWallet : connectWallet}
      className={`px-4 py-2 rounded-lg transition-colors duration-200 font-inter ${
        isConnected 
          ? "bg-[#14141C] text-white hover:bg-[#2A2A3C]" 
          : "bg-[#FFB734] text-black hover:bg-[#E6A52F]"
      }`}
    >
      {isConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
    </button>
  );
};