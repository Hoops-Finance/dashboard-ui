import React from 'react';

const SavingsWidget: React.FC = () => {
  return (
    <div className="bg-black text-white p-6 rounded-2xl shadow-lg relative" style={{ width: '350px', flexShrink: 0, maxWidth: '450px' }}>
      <div className="flex justify-between items-center mb-4 relative">
        <h2 className="text-xl font-bold">Savings Account</h2>
        <img src="/icons/info.svg" alt="Info" className="h-4 w-4 absolute top-0 right-0" /> {/* Info icon inside the SavingsWidget */}
      </div>
      <p className="text-sm mb-6" style={{ opacity: 0.64 }}>
        This account contains a selected amount of liquidity pools on the Stellar Blockchain sorted by risk and potential rewards.
      </p>
      <div className="mb-6 flex justify-between items-center">
        <p className="text-md">Combined APY</p>
        <p className="text-lg font-bold">3.2%</p>
      </div>
      <div className="mb-6 flex justify-between items-center">
        <p className="text-md">Active Pools</p>
        <p className="text-lg font-bold">5</p>
      </div>
      <div className="mb-6 flex justify-between items-center">
        <p className="text-md">Assessed Risk</p>
        <p className="text-lg font-bold">Moderate</p>
      </div>
      <button className="bg-yellow text-black font-semibold px-6 py-2 rounded-lg w-full hover:bg-gray-100">Save Funds</button>
    </div>
  );
};

export default SavingsWidget;