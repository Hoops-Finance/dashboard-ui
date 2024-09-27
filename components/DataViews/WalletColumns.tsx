import { TableColumn } from "react-data-table-component";
import { MyWalletData } from "../../utils/newTypes";

export const walletColumns: TableColumn<MyWalletData>[] = [
  { name: "Asset Type", selector: (row) => row.assetType, sortable: true },
  { name: "Asset Code", selector: (row) => row.assetCode, sortable: true },
  { name: "Asset Issuer", selector: (row) => row.assetIssuer, sortable: true },
  {
    name: "Balance",
    selector: (row) => parseFloat(row.balance), // Ensure sorting by numerical value
    sortable: true,
    cell: (row) => <div style={{ textAlign: "right" }}>{row.balance}</div>
  }
];
