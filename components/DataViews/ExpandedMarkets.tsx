import React from "react";
import DataTable from "react-data-table-component";
import { Market } from "../../utils/types";
import { pairColumns } from "../DataViews/PairColumns";
import { customTableStyles } from "./TableStyles";
import { useTheme } from "../ThemeContext"; // Import useTheme

export const ExpandedMarketComponent: React.FC<{ data: Market }> = ({ data }) => {
  const { theme } = useTheme(); // Access the theme using useTheme

  const token0Symbol = data.token0Details?.symbol || "Token0";
  const token1Symbol = data.token1Details?.symbol || "Token1";
  const token0Decimals = data.token0Details?.decimals || 6;
  const token1Decimals = data.token1Details?.decimals || 6;

  return (
    <div className="p-4 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg" style={{ transition: "max-height 0.3s ease-in-out", overflow: "hidden" }}>
      <h3 className="text-lg font-bold mb-2">
        Pairs for {data.token0Details?.symbol} / {data.token1Details?.symbol}
      </h3>
      <DataTable
        columns={pairColumns(token0Symbol, token1Symbol, token0Decimals, token1Decimals)}
        data={data.pools}
        pagination={false}
        noHeader
        customStyles={customTableStyles(theme)} // Pass theme to customTableStyles
      />
    </div>
  );
};
