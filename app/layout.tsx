"use client";

import React from "react";
import { ClientWalletProvider } from "@/components/ClientWalletProvider";
import Navbar from "@/components/Navbar";
import { Footer } from "@/components/ui/Footer";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { SessionProvider } from "next-auth/react";

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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background antialiased")}>
        <ThemeProvider defaultTheme="dark">
            <SessionProvider>
              <AuthProvider>
              <ClientWalletProvider>
                <Navbar />
                  <main className="flex-1">{children}</main>
                <Footer />
                </ClientWalletProvider>
              </AuthProvider>
            </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
