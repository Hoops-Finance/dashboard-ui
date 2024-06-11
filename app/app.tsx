import React from 'react';
import { createRoot } from 'react-dom/client';
import './globals.css';

const App: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold text-balance">
        Welcome to Hoops WebApp!
      </h1>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container!); // createRoot(container!) if you use TypeScript
root.render(<App />);
