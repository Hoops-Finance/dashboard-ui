"use client";

import { WalletConnection } from "../../components/Dashboard/WalletConnection";
import { Metrics } from "../../components/Dashboard/Metrics";
import { TableComponent } from "../../components/Dashboard/TableComponent";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 font-inter">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <WalletConnection />
        <Metrics />
      </div>
      <TableComponent />
    </div>
  );
}