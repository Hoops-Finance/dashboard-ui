// app/layout.tsx
"use client";

import React, { useEffect } from "react";
import { ClientWalletProvider } from "../components/ClientWalletProvider";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
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
    const theme = localStorage.getItem('theme') || 'dark';
    document.documentElement.classList.add(theme);
  }, []);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} bg-background text-foreground antialiased min-h-screen flex flex-col`}>
        <ThemeProvider>
          <ClientWalletProvider>
            <Navbar />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </ClientWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
