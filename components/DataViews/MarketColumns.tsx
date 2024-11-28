import { TableColumn } from "react-data-table-component";
import { Market } from "../../utils/newTypes";
import Image from 'next/image';

const protocolIcons: Record<string, string> = {
  phoenix: "/icons/protocol/phoenix.svg",
  soroswap: "/icons/protocol/soroswap2.svg",
  aqua: "/icons/protocol/aquarious.png"
};

export const marketColumns: TableColumn<Market>[] = [
  {
    name: "Market",
    selector: (row) => row.marketLabel,
    sortable: true,
    cell: (row) => <span className="font-bold">{row.marketLabel}</span>,
    minWidth: "100px",
    style: {
      justifyContent: "flex-start" // Left-align market names
    }
  },
  {
    name: "TVL",
    selector: (row) => row.totalTVL || 0,
    sortable: true,
    cell: (row) => <div className="text-left">{row.totalTVL ? `$${row.totalTVL.toLocaleString()}` : "-"}</div>,
    minWidth: "100px",
    style: {
      justifyContent: "flex-start" // Left-align TVL
    }
  },
  {
    name: "Protocols",
    cell: (row) => {
      const uniqueProtocols = Array.from(new Set(row.pools.map((pair) => pair.protocol)));
      return (
        <div className="flex justify-center items-center space-x-2">
          {uniqueProtocols.map((protocol) => (
            <Image
              key={protocol}
              src={protocolIcons[protocol]}
              alt={protocol}
              width={24}
              height={24}
              className="rounded-full"
            />
          ))}
        </div>
      );
    },
    minWidth: "100px",
    hide: 768, // Hide after pairs
    style: {
      justifyContent: "center" // Center-align protocols
    }
  },
  {
    name: "Pairs",
    selector: (row) => row.pools.length.toString(),
    sortable: true,
    cell: (row) => <div className="text-center">{row.pools.length}</div>,
    minWidth: "50px",
    hide: 992, // Hide first on smaller screens
    style: {
      justifyContent: "center" // Center-align pairs count
    }
  }
];
