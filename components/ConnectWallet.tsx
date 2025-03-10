"use client";

import { FC } from "react";
import {
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  XBULL_ID,
} from "@creit.tech/stellar-wallets-kit";
import { useWallet } from "@/contexts/WalletContext";
import {
  AccountResponse,
  BalanceLine,
  BalanceLineNative,
  BalanceLineAsset,
  BalanceLineLiquidityPool,
} from "@/utils/types";
import { Horizon } from "@stellar/stellar-sdk/minimal";

export const ConnectWallet: FC = () => {
  const { isConnected, updateWalletInfo } = useWallet();

  const connectWallet = async () => {
    const kit = new StellarWalletsKit({
      network: WalletNetwork.TESTNET,
      selectedWalletId: XBULL_ID,
      modules: allowAllModules(),
    });

    try {
      await kit.openModal({
        onWalletSelected: (option) => {
          // This must be synchronous
          kit.setWallet(option.id);

          // Handle async operations outside of the callback
          void (async () => {
            try {
              const { address } = await kit.getAddress();

              const server = new Horizon.Server("https://horizon.stellar.org", { allowHttp: true });

              const account: AccountResponse = await server.loadAccount(address);
              const balances: BalanceLine[] = account.balances;
              let xlmBalance: BalanceLineNative | undefined;

              const otherBalances: (
                | BalanceLineAsset<"credit_alphanum4" | "credit_alphanum12">
                | BalanceLineLiquidityPool
              )[] = [];
              balances.forEach((balance) => {
                if (balance.asset_type === "native") {
                  xlmBalance = balance;
                } else {
                  otherBalances.push(balance);
                }
              });

              const newBalance = xlmBalance ? xlmBalance.balance : "0";

              updateWalletInfo(true, address, newBalance, otherBalances);
            } catch (error) {
              console.error("Error loading account:", error);
              updateWalletInfo(true, null, "0", []);
            }
          })();
        },
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
    }
  };

  const disconnectWallet = async () => {
    updateWalletInfo(false, null, null, null);
  };

  return (
    <button
      onClick={() => {
        if (isConnected) {
          void disconnectWallet(); // Explicitly ignore the promise
        } else {
          void connectWallet(); // Explicitly ignore the promise
        }
      }}
      className={`w-full px-2 py-1.5 text-sm rounded-md ${
        isConnected
          ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
          : "bg-primary text-primary-foreground hover:bg-primary/90"
      }`}
    >
      {isConnected ? "Disconnect Wallet" : "Connect Wallet"}
    </button>
  );
};
