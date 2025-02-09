import { ReactNode } from "react";
import { cookies } from "next/headers";
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
  variable: "--font-inter"
});

// Read the 'theme' cookie server-side, default to 'dark'
async function getInitialThemeCookie(): Promise<"dark" | "light"> {
  "use server";
  const themeCookies = await cookies();
  const themeCookie = themeCookies.get("theme")?.value;
  if (themeCookie === "light") return "light";
  return "dark";
}
export default async function RootLayout({ children }: { children: ReactNode }) {
  const initialTheme = await getInitialThemeCookie();

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
