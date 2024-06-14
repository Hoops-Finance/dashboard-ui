import React from 'react';

const TopWidget: React.FC = () => {
  return (
    <div className="relative bg-cover bg-center h-48 w-full max-w-screen-2xl mx-auto rounded-2xl" style={{ backgroundImage: "url('/images/background2.png')" }}>
      <div className="absolute inset-0 bg-black opacity-50 rounded-2xl"></div>
      <div className="relative z-10 flex items-center justify-between h-full px-8 text-white">
        <h1 className="text-4xl font-bold font-lora">Pool Members</h1>
        <div className="flex space-x-4">
          <div className="relative bg-white text-black py-4 px-8 w-80 rounded-lg shadow-md font-inter flex flex-col items-start space-y-2">
            <div className="absolute top-2 right-2">
              <img src="/icons/info.png" alt="Info" className="h-4 w-4" />
            </div>
            <div className="flex items-center">
              <span className="circle-icon mr-2"></span>
              <h2 className="text-lg font-semibold text-left">Total Supply</h2>
            </div>
            <p className="text-2xl font-bold text-left">$38.36M</p>
            <p className="text-sm bg-gray-300 rounded-32px px-2 py-1 text-left"># Pools Indexed: 5</p>
          </div>
          <div className="relative bg-white text-black py-4 px-8 w-80 rounded-lg shadow-md font-inter flex flex-col items-start space-y-2">
            <div className="absolute top-2 right-2">
              <img src="/icons/info.png" alt="Info" className="h-4 w-4" />
            </div>
            <div className="flex items-center">
              <span className="circle-icon mr-2"></span>
              <h2 className="text-lg font-semibold text-left">Total Volume</h2>
            </div>
            <p className="text-2xl font-bold text-left">$10.33M</p>
            <p className="text-sm bg-gray-300 rounded-32px px-2 py-1 text-left"># of Swaps: 149</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopWidget;