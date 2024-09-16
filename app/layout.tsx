// app/layout.tsx
import { ReactNode } from 'react';
import Navbar from '../components/Navbar';
import './globals.css';
import Providers from './providers';

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Navbar />
          <main className="pt-20">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
