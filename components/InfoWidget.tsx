import React from 'react';

const InfoWidget: React.FC = () => {
  return (
    <div className="bg-purple p-6 rounded-2xl shadow-lg mt-8" style={{ width: '350px', flexShrink: 0, maxWidth: '450px' }}>
      <h2 className="text-md text-black font-bold mb-4">Your community is here to help</h2>
      <a href="#" className="text-md text-black underline">Frequently Asked Questions</a>
    </div>
  );
};

export default InfoWidget;