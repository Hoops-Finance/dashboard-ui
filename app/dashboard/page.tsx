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
      <div className="max-w-screen-2xl mx-auto flex">
        <div className="w-3/5 pr-4"> {/* 60% width for Balances and MapWidget */}
          <Balances />
          <MapWidget />
        </div>
        <div className="w-2/5 pl-4"> {/* 40% width for SavingsWidget and InfoWidget */}
          <SavingsWidget />
          <InfoWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


