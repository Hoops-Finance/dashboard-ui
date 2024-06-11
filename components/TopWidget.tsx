import React from 'react';

const TopWidget: React.FC = () => {
  return (
    <div className="relative bg-cover bg-center h-48 w-full max-w-screen-2xl mx-auto rounded-2xl" style={{ backgroundImage: "url('/images/background1.png')" }}>
      <div className="absolute inset-0 bg-black opacity-50 rounded-2xl"></div>
      <div className="relative z-10 flex items-center justify-between h-full px-8 text-white">
        <h1 className="text-4xl font-bold font-lora">Pool Members</h1>
        <div className="flex space-x-4">
          <div className="bg-white text-black p-4 rounded-lg shadow-md font-inter">
            <h2 className="text-lg font-semibold">Total Supply</h2>
            <p className="text-2xl font-bold">$38.36M</p>
            <p className="text-sm"># of Lenders: 648</p>
          </div>
          <div className="bg-white text-black p-4 rounded-lg shadow-md font-inter">
            <h2 className="text-lg font-semibold">Total Borrowed</h2>
            <p className="text-2xl font-bold">$10.33M</p>
            <p className="text-sm"># of Borrowers: 149</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopWidget;