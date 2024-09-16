import PoolInfo from '../../components/PoolData';
import { Search } from 'lucide-react';

export default function PoolDataPage() {
  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6">
        <h1 className="text-3xl font-bold mb-4 md:mb-0">Pool Data</h1>
        <div className="flex w-full md:w-1/2 lg:w-2/3">
          <div className="relative flex-grow mr-2">
            <input
              type="text"
              placeholder="Insert pair address"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB734] focus:border-transparent"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <button className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center">
            <Search size={20} className="mr-2" />
            <span>Search</span>
          </button>
        </div>
      </div>
      <PoolInfo />
    </div>
  );
}