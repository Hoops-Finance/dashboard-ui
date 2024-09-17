import React, { ReactNode } from "react";
import Navbar from "../components/Navbar";
import { ClientWalletProvider } from "../components/ClientWalletProvider";
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
    <html lang="en" className={inter.className}>
      <head />
      <body>
        <ClientWalletProvider>
          <Navbar />
          <main className="pt-16">{children}</main>
        </ClientWalletProvider>
      </body>
    </html>
  );
}
