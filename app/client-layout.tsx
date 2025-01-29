"use client";

import { ReactNode } from "react";
import { ClientWalletProvider } from "@/components/ClientWalletProvider";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DataProvider } from "@/contexts/DataContext";
import { SessionProvider } from "next-auth/react";

interface ClientLayoutProps {
  children: ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider defaultTheme="dark">
      <SessionProvider>
        <ClientWalletProvider>
          <DataProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </DataProvider>
        </ClientWalletProvider>
      </SessionProvider>
    </ThemeProvider>
  );
}
