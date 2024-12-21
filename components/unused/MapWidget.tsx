import { FC } from "react";
import { MagnifyingGlassCircleIcon } from "@heroicons/react/24/outline";

const MapWidget: FC = () => {
  return (
    <div className="p-6 rounded-lg">
      <div className="flex items-center mb-4">
        <h2 className="text-2xl font-bold text-black  mr-4">Buy USDC</h2>
        <div className="relative flex-grow">
          <input id="search" type="text" placeholder="Find deposit/withdrawal locations" className="w-full p-2 border border-gray-300 rounded-full pl-12" />
          <MagnifyingGlassCircleIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-6 w-6" />
        </div>
      </div>
      <div className="bg-gray-300 rounded-2xl h-52 shadow-lg w-full"></div> {/* Placeholder for the map */}
    </div>
  );
};

export default MapWidget;
