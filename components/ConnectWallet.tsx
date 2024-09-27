"use client";

import React from "react";
import { StellarWalletsKit, WalletNetwork, allowAllModules, XBULL_ID } from "@creit.tech/stellar-wallets-kit";
import { useWallet } from "./WalletContext";
import { Horizon } from "@stellar/stellar-sdk";
import { AccountResponse, HorizonApi } from "@stellar/stellar-sdk/lib/horizon";

export const ConnectWallet: React.FC = () => {
  const { isConnected, updateWalletInfo } = useWallet();

  const connectWallet = async () => {
    const kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: XBULL_ID,
      modules: allowAllModules()
    });

    try {
      await kit.openModal({
        onWalletSelected: async (option) => {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();

          try {
            const server = new Horizon.Server("https://horizon.stellar.org", { allowHttp: true });

            const account: AccountResponse = await server.loadAccount(address);
            const balances: HorizonApi.BalanceLine[] = account.balances;
            let xlmBalance: HorizonApi.BalanceLineNative | undefined;

            const otherBalances: (HorizonApi.BalanceLineAsset | HorizonApi.BalanceLineLiquidityPool)[] = [];
            // Process all balances in a single loop asynchronously
            await Promise.all(
              balances.map(async (balance) => {
                if (balance.asset_type === "native") {
                  xlmBalance = balance;
                } else {
                  otherBalances.push(balance as HorizonApi.BalanceLineAsset | HorizonApi.BalanceLineLiquidityPool);
                }
              })
            );
            const newBalance = xlmBalance ? xlmBalance.balance : "0";

            updateWalletInfo(true, address, newBalance, otherBalances);
          } catch (error) {
            console.error("Error loading account:", error);
            updateWalletInfo(true, address, "0", []);
          }
        }
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = async () => {
    updateWalletInfo(false, null, null, null);
  };

  return (
    <button onClick={isConnected ? disconnectWallet : connectWallet} className={`button-base ${isConnected ? "button-dark" : "button-light"}`}>
      {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
    </button>
  );
};
