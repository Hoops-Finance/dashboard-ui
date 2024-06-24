import React from 'react';
import './TopWidget.css'; // Import the custom CSS file

const TopWidget: React.FC = () => {
  return (
    <div className="relative bg-cover bg-center h-48 mobile:h-[224px] mobile-landscape:h-[224px] w-full md:max-w-screen-2xl md:mx-auto md:rounded-2xl rounded-b-2xl md:rounded-t-2xl" style={{ backgroundImage: "url('/images/background2.png')" }}>
      <div className="absolute inset-0 bg-black opacity-50 md:rounded-2xl rounded-b-2xl md:rounded-t-2xl"></div>
      <div className="relative z-10 flex flex-col md:flex-row items-center md:items-center justify-center h-full px-0 md:px-8 text-white">
        <h1 className="text-4xl font-bold font-lora mb-4 md:mb-0 md:mr-4 custom-wrap">Pool Members</h1>
        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 w-full justify-center items-center">
          <div id="totalSupply" className="relative bg-white text-black py-4 px-8 w-full max-w-xs md:w-64 rounded-lg shadow-md font-inter flex flex-col items-center space-y-2 mobile:max-w-[224px] mobile-landscape:max-w-[224px] mobile:p-4 mobile-landscape:p-4">
            <div className="absolute top-2 right-2">
              <img src="/icons/info.png" alt="Info" className="h-4 w-4" />
            </div>
            <div className="flex items-center">
              <span className="circle-icon mr-2"></span>
              <h2 className="text-lg font-semibold text-center">Total Supply</h2>
            </div>
            <p className="text-2xl font-bold text-center">$38.36M</p>
            <p className="text-sm bg-gray-300 rounded-32px px-2 py-1 text-center"># Pools Indexed: 5</p>
          </div>
          <div id="totalVolume" className="relative bg-white text-black py-4 px-8 w-full max-w-xs md:w-64 rounded-lg shadow-md font-inter flex flex-col items-center space-y-2 hidden md:flex mobile:max-w-[224px] mobile-landscape:max-w-[224px] mobile:p-4 mobile-landscape:p-4">
            <div className="absolute top-2 right-2">
              <img src="/icons/info.png" alt="Info" className="h-4 w-4" />
            </div>
            <div className="flex items-center">
              <span className="circle-icon mr-2"></span>
              <h2 className="text-lg font-semibold text-center">Total Volume</h2>
            </div>
            <p className="text-2xl font-bold text-center">$10.33M</p>
            <p className="text-sm bg-gray-300 rounded-32px px-2 py-1 text-center"># of Swaps: 149</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopWidget;