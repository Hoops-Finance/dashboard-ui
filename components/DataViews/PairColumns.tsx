//this is distinct from poolscolumns, and is used in the expanded markets
import { TableColumn } from "react-data-table-component";
import { Pair } from "@/utils/newTypes";

export const pairColumns = (token0Symbol: string, token1Symbol: string, token0Decimals: number, token1Decimals: number): TableColumn<Pair>[] => [
  {
    name: "Protocol",
    selector: (row) => row.protocol || "",
    sortable: true
  },
  {
    name: "Pair Address",
    selector: (row) => row.id || "",
    sortable: true
  },
  {
    name: `Reserve ${token0Symbol}`,
    selector: (row) => (row.reserve0 ? (row.reserve0 / 10 ** token0Decimals).toFixed(2) : "0.00"),
    sortable: true
  },
  {
    name: `Reserve ${token1Symbol}`,
    selector: (row) => (row.reserve1 ? (row.reserve1 / 10 ** token1Decimals).toFixed(2) : "0.00"),
    sortable: true
  },
  {
    name: "TVL",
    selector: (row) => (row.tvl ? row.tvl : 0),
    sortable: true
  }
];
