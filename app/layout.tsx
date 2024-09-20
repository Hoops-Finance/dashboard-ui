// app/layout.tsx
"use client";

import React, { ReactNode, useEffect } from "react";
import { ClientWalletProvider } from "../components/ClientWalletProvider";
import Navbar from "../components/Navbar";
import { ThemeProvider } from "../components/ThemeContext";
import "./globals.css";
import { Inter } from "next/font/google";
import { Lit } from "litlyx-js"; // Import Litlyx

interface RootLayoutProps {
  children: ReactNode;
}

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter"
});

export default function RootLayout({ children }: RootLayoutProps) {
  useEffect(() => {
    const projectId = process.env.LITLX_ID;
    if (projectId) {
      Lit.init(projectId);
    } else {
      console.error("Litlyx project ID is not defined in the environment variables.");
    }
  }, []);

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
