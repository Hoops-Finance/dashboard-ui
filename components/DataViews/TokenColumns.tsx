// TokenColumns.tsx

import { TableColumn } from "react-data-table-component";
import { ProcessedToken } from "@/utils/newTypes";
import Image from "next/image";

export const tokenColumns: TableColumn<ProcessedToken>[] = [
  {
    name: "Token",
    selector: (row) => row.token.symbol,
    sortable: true,
    cell: (row) => (
      <div className="flex items-center">
        {row.token.logoUrl ? <Image src={row.token.logoUrl} alt={row.token.name} width={32} height={32} className="h-8 w-8 mr-2" /> : <div className="h-8 w-8 mr-2 bg-gray-300 rounded-full"></div>}
        <span className="text-primary font-bold">{row.token.symbol}</span>
      </div>
    )
  },
  {
    name: "Name",
    selector: (row) => row.token.name,
    sortable: true
  },
  {
    name: "Number of Markets",
    selector: (row) => row.numberOfMarkets.toString(),
    sortable: true
  },
  {
    name: "Total TVL",
    selector: (row) => row.totalTVL,
    sortable: true,
    cell: (row) => `$${row.totalTVL.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }
];
