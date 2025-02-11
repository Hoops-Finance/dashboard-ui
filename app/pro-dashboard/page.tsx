"use client";
import dynamic from "next/dynamic";

import MetricsSummary from "@/components/ProDash/metrics-summary";
import FinancialPlaylistList from "@/components/ProDash/financial-playlist-list";

export default function DashboardPage() {
  const PerformanceGraph = dynamic(() => import("@/components/ProDash/performance-graph"), {
    ssr: false,
    loading: () => <p>Loading chart…</p>,
  });
  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">Hoops Finance Pro Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <MetricsSummary />
          <PerformanceGraph />
        </div>
        <div className="lg:col-span-1">
          <FinancialPlaylistList />
        </div>
      </div>
    </div>
  );
}
