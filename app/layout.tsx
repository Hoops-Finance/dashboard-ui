import React, { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import './globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="pt-16"> {/* Add padding-top to account for fixed navbar */}
          {children}
        </main>
      </body>
    </html>
  );
}