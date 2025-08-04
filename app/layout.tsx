import { ReactNode } from "react";
import { ClientLayout } from "./client-layout";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import { GoogleAnalytics } from '@next/third-parties/google'

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
});

import { generateMetadata } from "@/lib/metadata";

export const metadata = generateMetadata({
  title: "Dashboard",
  description: "Custom page description"
});

export default function RootLayout({ children }: { children: ReactNode }) {
  const initialTheme = "dark";

  return (
    <html lang="en" className={cn(inter.variable, initialTheme)}>
      <body className="min-h-screen bg-background antialiased" cz-shortcut-listen="true">
        <ClientLayout>{children}</ClientLayout>
      </body>
      <GoogleAnalytics gaId="G-WM6MY8V617" />
    </html>
  );
}
