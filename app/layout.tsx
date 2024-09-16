import React, { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import { ClientWalletProvider } from '../components/ClientWalletProvider';
import './globals.css';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <ClientWalletProvider>
          <Navbar />
          <main className="pt-16">
            {children}
          </main>
        </ClientWalletProvider>
      </body>
    </html>
  );
}