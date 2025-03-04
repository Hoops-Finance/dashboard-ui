import { ReactNode } from "react";
import { Metadata } from "next";
import { ClientLayout } from "./client-layout";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter"
});

import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Dashboard",
  description: "Custom page description"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={cn("min-h-screen bg-background antialiased")}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
