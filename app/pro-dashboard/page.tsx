import MetricsSummary from '@/components/metrics-summary'
import PerformanceGraph from '@/components/performance-graph'
import FinancialPlaylistList from '@/components/financial-playlist-list'

export default function DashboardPage() {
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
  )
}

