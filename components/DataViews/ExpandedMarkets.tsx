import React from "react";
import DataTable from "react-data-table-component";
import { Market, Pair } from "../../utils/newTypes";
import { pairColumns } from "../DataViews/PairColumns";
import { customTableStyles } from "./TableStyles";
import { useTheme } from "../ThemeContext";
import { ExpanderComponentProps } from "react-data-table-component";

interface ExpandedMarketComponentProps extends ExpanderComponentProps<Market> {
  handleRowClick: (row: Pair, tab: string) => void;
}

export const ExpandedMarketComponent: React.FC<ExpandedMarketComponentProps> = ({ data, handleRowClick }) => {
  const { theme } = useTheme();

  const token0Symbol = data.token0.symbol || "Token0";
  const token1Symbol = data.token1.symbol || "Token1";
  const token0Decimals = data.token0.decimals || 6;
  const token1Decimals = data.token1.decimals || 6;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg">
      <h3 className="text-lg font-bold mb-2">
        Pairs for {token0Symbol} / {token1Symbol}
      </h3>
      <div className="overflow-x-auto">
        <DataTable
          columns={pairColumns(token0Symbol, token1Symbol, token0Decimals, token1Decimals)}
          data={data.pools}
          pagination={false}
          noHeader
          customStyles={customTableStyles(theme)}
          onRowClicked={(row) => handleRowClick(row, "pairs")}
        />
      </div>
    </div>
  );
};
