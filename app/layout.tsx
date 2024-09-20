"use client";

import React, { ReactNode } from "react";
import { ClientWalletProvider } from "../components/ClientWalletProvider";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "../components/ThemeContext"; // Import ThemeProvider
import "./globals.css";
import { Inter } from "next/font/google";

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
      <head />
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
