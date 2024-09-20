import { HorizonApi } from "@stellar/stellar-sdk/lib/horizon";
import { MyWalletData, TokenDetails } from "./types";

export const updateWalletData = (
  otherBalances: (HorizonApi.BalanceLineAsset<"credit_alphanum4" | "credit_alphanum12"> | HorizonApi.BalanceLineLiquidityPool)[] | null,
  showTrackedOnly: boolean,
  showZeroBalances: boolean,
  tabData: { tokens: TokenDetails[] },
  setFilteredWalletData: (data: MyWalletData[]) => void
) => {
  const newFilteredData = otherBalances
    ? otherBalances
        .filter((balance) => {
          if (!showZeroBalances && parseFloat(balance.balance) === 0) return false;
          if (showTrackedOnly) {
            if (balance.asset_type === "credit_alphanum4" || balance.asset_type === "credit_alphanum12") {
              const token = tabData?.tokens.find((token) => {
                const [symbol, issuer] = token.name.split(":");
                return token.symbol === balance.asset_code && issuer === balance.asset_issuer;
              });
              return token ? true : false;
            }
            return false;
          }
          return true;
        })
        .map((balance) => {
          if (balance.asset_type === "liquidity_pool_shares") {
            return {
              assetType: "Liquidity Pool Shares",
              assetCode: "N/A",
              assetIssuer: balance.liquidity_pool_id,
              balance: parseFloat(balance.balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            };
          } else {
            return {
              assetType: balance.asset_type,
              assetCode: balance.asset_code,
              assetIssuer: balance.asset_issuer,
              balance: parseFloat(balance.balance).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })
            };
          }
        })
    : [];

  setFilteredWalletData(newFilteredData);
};
