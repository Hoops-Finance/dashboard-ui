import { TableColumn } from "react-data-table-component";
import { Market } from "../../utils/types";

export const marketColumns: TableColumn<Market>[] = [
  {
    name: "Market",
    selector: (row) => row.marketLabel,
    sortable: true,
    cell: (row) => <span className="font-bold text-lg text-center">{row.marketLabel}</span>
  },
  {
    name: "Tokens",
    cell: (row) => <div className="text-center">{`${row.token0Details?.symbol} / ${row.token1Details?.symbol}`}</div>,
    sortable: true
  },
  {
    name: "Pairs Count",
    selector: (row) => row.pools.length.toString(),
    sortable: true,
    cell: (row) => <div className="text-center">{row.pools.length}</div>
  },
  {
    name: "Total TVL",
    selector: (row) => (row.totalTVL ? row.totalTVL : 0),
    sortable: true,
    cell: (row) => <div className="text-right">{row.totalTVL ? `$${row.totalTVL.toLocaleString()}` : "-"}</div>
  }
];
