import React from "react";
import DataTable from "react-data-table-component";
import { ExpanderComponentProps } from "react-data-table-component";
import { Pair, ProcessedToken, TokenMarket } from "@/utils/newTypes";
import { pairColumns } from "@/components/DataViews/PairColumns";
import { useTheme } from "@/contexts/ThemeContext";
import { customTableStyles } from "@/components/DataViews/TableStyles";

interface ExpandedTokenComponentProps extends ExpanderComponentProps<ProcessedToken> {
  handleRowClick: (row: Pair, tab: string) => void;
}

export const ExpandedTokenComponent: React.FC<ExpandedTokenComponentProps> = ({ data, handleRowClick }) => {
  const { theme } = useTheme(); // Access theme to apply custom styles

  return (
    <div className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg" style={{ transition: "max-height 0.3s ease-in-out", overflow: "hidden" }}>
      {data.markets.map((market: TokenMarket, index: number) => {
        const token0Symbol = data.token.symbol;
        const token1Symbol = market.counterTokenDetails.symbol;
        const token0Decimals = data.token.decimals || 7;
        const token1Decimals = market.counterTokenDetails.decimals || 7;

        return (
          <div key={index} className="mb-4">
            <h3 className="text-lg font-bold mb-2">Market: {market.counterTokenSymbol}</h3>
            <div className="text-right mb-4">Total TVL: {`$${market.totalTVL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}</div>
            <DataTable
              columns={pairColumns(token0Symbol, token1Symbol, token0Decimals, token1Decimals)}
              data={market.pairs}
              pagination={false}
              noHeader
              customStyles={customTableStyles(theme)} // Use theme-based custom styles
              onRowClicked={(row) => handleRowClick(row, "pairs")}
            />
          </div>
        );
      })}
    </div>
  );
};
