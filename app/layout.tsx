"use client";
export const experimental_ppr = true;
import { ReactNode } from "react";
import { ClientWalletProvider } from "@/components/ClientWalletProvider";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
import { DataProvider } from "@/contexts/DataContext";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  const initialTheme = "dark";

  return (
    <html lang="en" className={cn(inter.variable, initialTheme)}>
      <body className="min-h-screen bg-background antialiased">
        <SessionProvider>
          <ClientWalletProvider>
            <DataProvider>
              <Navbar />
              <main className="flex-1">{children}</main>
              <Footer />
            </DataProvider>
          </ClientWalletProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
