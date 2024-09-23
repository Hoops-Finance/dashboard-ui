// app/layout.tsx
"use client";

import React, { ReactNode } from "react";
import { ClientWalletProvider } from "../components/ClientWalletProvider";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "../components/ThemeContext";
import "./globals.css";
import { Inter } from "next/font/google";
import PlausibleProvider from "next-plausible";

interface RootLayoutProps {
  children: ReactNode;
}

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter"
});

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script defer data-domain="hoops.stellar.red" src="https://hoops-analytics.stellar.red/js/script.js"></script>

        <PlausibleProvider domain="hoops.stellar.red" customDomain="hoops-analytics.stellar.red" selfHosted />
      </head>
      <body>
        <ThemeProvider>
          <ClientWalletProvider>
            <Navbar />
            <main className="pt-16">{children}</main>
          </ClientWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
