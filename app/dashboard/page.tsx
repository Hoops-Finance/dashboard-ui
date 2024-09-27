import React from 'react';
import Balances from '../../components/Balances';
import SavingsWidget from '../../components/SavingsWidget';
import MapWidget from '../../components/MapWidget';
import InfoWidget from '../../components/InfoWidget';

const Dashboard: React.FC = () => {
  return (
    <div
      className="bg-white min-h-screen p-6"
      style={{ backgroundImage: "url('/images/dash-bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >
      <div className="max-w-screen-2xl mx-auto flex flex-col tablet:flex-col lg:flex-row">
        <div className="w-full lg:w-3/5 pr-4 flex flex-col items-center tablet:items-center lg:items-start"> {/* Centered on mobile, side by side on larger screens */}
          <Balances />
          <MapWidget />
        </div>
        <div className="w-full lg:w-2/5 pl-4 flex flex-col items-center tablet:items-center lg:items-start"> {/* Centered on mobile, side by side on larger screens */}
          <SavingsWidget />
          <InfoWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
