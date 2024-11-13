// app/layout.tsx
"use client";

import React, { ReactNode, useState } from "react";
import { ClientWalletProvider } from "../components/ClientWalletProvider";
import Navbar from "../components/Navbar";
import { ThemeProvider, useTheme } from "../components/ThemeContext";
import "./globals.css";
import { Inter } from "next/font/google";
import PlausibleProvider from "next-plausible";

interface RootLayoutProps {
  children: ReactNode;
}

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter"
});

function Layout({ children }: RootLayoutProps) {
  const [showModal, setShowModal] = useState(true);
  const { theme } = useTheme();

  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script defer data-domain="app.hoops.finance" src="https://analytics.hoops.finance/js/script.js"></script>
        <link rel="stylesheet" type="text/css" href="https://app.hoops.finance/charting_library/charting_library.css" />

        <PlausibleProvider domain="app.hoops.finance" customDomain="analytics.hoops.finance" selfHosted />
      </head>
      <body>
        <script type="text/javascript" src="https://app.hoops.finance/charting_library/charting_library.js"></script>
        <ThemeProvider>
          <ClientWalletProvider>
            <Navbar />
            <main className="pt-16">{children}</main>

            {showModal && (
              <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-md z-50">
                <div className={`p-6 rounded-lg shadow-lg max-w-md w-full ${theme === "dark" ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}>
                  <h2 className="text-xl font-semibold mb-4">Disclaimer</h2>
                  <p className={`mb-4 ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    This website is currently a development demo, and as such we do not suggest using it for real life tasks yet. There may be errors in data, or in functionality as we are still
                    building it. Otherwise, feel free to look around.
                  </p>
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded transition-colors duration-200" onClick={() => setShowModal(false)}>
                    I understand
                  </button>
                </div>
              </div>
            )}
          </ClientWalletProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

export default function RootLayout(props: RootLayoutProps) {
  return (
    <ThemeProvider>
      <Layout {...props} />
    </ThemeProvider>
  );
}
