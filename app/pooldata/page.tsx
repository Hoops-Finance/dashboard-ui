"use client";

import { useState } from 'react';
import PoolInfo from '../../components/PoolData';
import Swap from '../../components/Swap';
import { Search } from 'lucide-react';

export default function PoolDataPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="container mx-auto p-4 flex justify-center items-start min-h-screen">
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-7xl">
        <div className="w-full lg:w-1/3 lg:sticky lg:top-20 self-start">
          <Swap />
        </div>
        <div className="w-full lg:w-2/3 self-start">
          <h1 className="text-3xl font-bold mb-6">Pool Data</h1>
          <div className="flex mb-6">
            <div className="relative flex-grow mr-2">
              <input
                type="text"
                placeholder="Insert pair address"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB734] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            </div>
            <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
              <Search size={20} className="mr-2" />
              <span>Search</span>
            </button>
          </div>
          <PoolInfo />
        </div>
      </div>
    </div>
  );
}