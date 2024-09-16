// app/pools/page.tsx
'use client';

import { useEffect, useState } from 'react';
import TopWidget from '../../components/TopWidget';
import DataTable from '../../components/DataTable';
import '../../app/globals.css'; // Ensure global styles are imported

interface Data {
  pairId: string;
  marketIcon: string;
  market: string;
  protocol: string;
  totalValueLocked: string;
  volume: string;
  fees: string;
  apr: string;
  trendingapr?: string;
  utilization: string;
  riskScore: string;
  rankingScore: string;
}

type SortKey = keyof Data;

export default function Pools() {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);
  const [period, setPeriod] = useState('7d');
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'ascending' | 'descending' } | null>(null);

  useEffect(() => {
    fetchData(period);
    fetchMetrics(period);
  }, [period]);

  const fetchData = async (period: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/getstatistics?period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result: Data[] = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data from API:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMetrics = async (period: string) => {
    setLoadingMetrics(true);
    try {
      const response = await fetch(`/api/getmetrics?period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setMetrics(result);
    } catch (error) {
      console.error('Error fetching metrics from API:', error);
    } finally {
      setLoadingMetrics(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  const handleSort = (key: SortKey) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = () => {
    if (!sortConfig) return data;
    const sortedArray = [...data].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? '';
      const bValue = b[sortConfig.key] ?? '';
      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
    return sortedArray;
  };

  return (
    <div className="container mx-auto px-4 pt-20">
      <main className="flex flex-col items-center justify-start">
        <h1 className="text-4xl font-bold mb-6">Pools</h1>
        <TopWidget period={period} metrics={metrics} loadingMetrics={loadingMetrics} />
        <div className="w-full max-w-screen-2xl mt-6">
          <div className="flex justify-end mb-4">
            <label htmlFor="period" className="mr-2 font-medium text-black dark:text-white">
              Select Period:
            </label>
            <select
              id="period"
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="border border-gray-300 dark:border-gray-600 rounded p-2 text-black dark:text-white bg-white dark:bg-gray-800"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="60d">60 Days</option>
              <option value="90d">90 Days</option>
              <option value="180d">180 Days</option>
            </select>
          </div>
          {loading ? (
            <p className="text-black dark:text-white">Loading...</p>
          ) : (
            <DataTable data={sortedData()} handleSort={handleSort} />
          )}
        </div>
      </main>
    </div>
  );
}
