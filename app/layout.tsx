// app/layout.tsx
"use client";

import React, { useEffect } from "react";
import { ClientWalletProvider } from "../components/ClientWalletProvider";
import Navbar from "@/components/Navbar";
import { ThemeProvider } from "../components/ThemeContext";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter"
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    // Get initial theme from localStorage or default to dark
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.add(theme);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-background text-foreground antialiased`}>
        <ThemeProvider>
          <ClientWalletProvider>
            <Navbar />
            {children}
          </ClientWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
