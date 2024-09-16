"use client";

import { Card } from '../ui';

export function Metrics() {
  return (
    <div className="grid grid-cols-3 gap-4">
      {['TVL', 'Volume', 'APY%'].map((metric) => (
        <Card key={metric} className="p-4 transition-all duration-300 hover:shadow-xl">
          <h3 className="text-sm font-medium text-gray-500 mb-1">{metric}</h3>
          <p className="text-2xl font-bold text-black">
            {metric === 'TVL' ? '$2.15B' : metric === 'Volume' ? '$825M' : '5.5%'}
          </p>
        </Card>
      ))}
    </div>
  );
}