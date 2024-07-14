'use client';

import { useEffect, useState } from 'react';
import Navbar from '../../components/Navbar';
import TopWidget from '../../components/TopWidget';
import DataTable from '../../components/DataTable';

interface Data {
  pairId: string;
  marketIcon: string;
  market: string;
  totalValueLocked: string;
  volume: string;
  fees: string;
  trendingapr?: string;
  apr: string;
  utilization: string;
  riskScore: string;
  rankingScore: string;
}

export default function Home() {
  const [data, setData] = useState<Data[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const fetchData = async (period: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/getstatistics?period=${period}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data from API:", error);
      setLoading(false);
    }
  };

  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
  };

  return (
    <div className="bg-white min-h-screen">
      <Navbar />
      <main className="flex flex-col items-center justify-start p-6 mobile-landscape:p-0">
        <TopWidget />
        <div className="w-full max-w-screen-2xl mt-6">
          <div className="flex justify-end mb-4">
            <label htmlFor="period" className="mr-2 font-medium">Select Period:</label>
            <select
              id="period"
              value={period}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="border border-gray-300 rounded p-2"
            >
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
            </select>
          </div>
          {loading ? <p>Loading...</p> : <DataTable data={data} />}
        </div>
      </main>
    </div>
  );
}
