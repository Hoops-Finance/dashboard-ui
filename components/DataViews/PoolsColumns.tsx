import { TableColumn } from "react-data-table-component";
import { PoolData } from "../../utils/types";

export const poolsColumns: TableColumn<PoolData>[] = [
  {
    name: "Market",
    selector: (row) => row.market,
    sortable: true,
    cell: (row) => (
      <div className="flex items-center">
        <img src={row.marketIcon} alt={row.market} className="h-8 w-8 object-contain mr-2" />
        <span>{row.market}</span>
      </div>
    )
  },
  {
    name: "Protocol",
    selector: (row) => row.protocol,
    sortable: true
  },
  {
    name: "Total Value Locked",
    selector: (row) => parseFloat(row.totalValueLocked),
    sortable: true,
    cell: (row) => `$${parseFloat(row.totalValueLocked).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  {
    name: "Volume",
    selector: (row) => parseFloat(row.volume),
    sortable: true,
    cell: (row) => `$${parseFloat(row.volume).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  {
    name: "Fees",
    selector: (row) => parseFloat(row.fees),
    sortable: true,
    cell: (row) => `$${parseFloat(row.fees).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
  {
    name: "APR",
    selector: (row) => parseFloat(row.apr),
    sortable: true,
    cell: (row) => `${row.apr}`
  },
  {
    name: "Trending APR",
    selector: (row) => parseFloat(row.trendingapr || "0"),
    sortable: true,
    cell: (row) => {
      const trendingAPR = parseFloat(row.trendingapr || "0");
      return <span className={trendingAPR > parseFloat(row.apr) ? "text-green-500" : "text-red-500"}>{row.trendingapr || "0.00"}%</span>;
    }
  },
  {
    name: "Utilization",
    selector: (row) => parseFloat(row.utilization),
    sortable: true,
    cell: (row) => `${row.utilization}`
  },
  {
    name: "Risk Score",
    selector: (row) => parseFloat(row.riskScore),
    sortable: true,
    cell: (row) => row.riskScore
  }
];
