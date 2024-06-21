import React, { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import './globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <html lang="en">
      <body className="bg-white">
        <Navbar />
        <main className="pt-16 lg:pt-20"> {/* Adjust padding to ensure content is not hidden behind the navbar */}
          {children}
        </main>
      </body>
    </html>
  );
};

export default RootLayout;