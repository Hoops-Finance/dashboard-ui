"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MagnifyingGlassIcon, Bars4Icon, XMarkIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useTheme } from "./ThemeContext";
import { SignInButton } from "./SignInButton";

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="w-full bg-white dark:bg-gray-800 shadow-md font-inter fixed top-0 left-0 right-0 z-50 border-b border-gray-300 dark:border-gray-700">
      {/* Top bar with clickable disclaimer */}
      <div
        className="w-full bg-black text-yellow-500 font-inter font-bold text-center py-2 cursor-pointer"
        onClick={() => setShowModal(true)}
      >
        This is a development demo, use at your own risk.
      </div>

      <div className="max-w-screen-2xl mx-auto flex justify-between items-center relative px-6 py-4">
        <Link href="/dashboard" className="inline-flex items-center gap-2 font-inter">
          <Image src="/images/logo2.svg" alt="Logo" width={64} height={64} className={`h-8 w-auto ${theme === "dark" ? "invert" : ""}`} />
        </Link>
        <div className="hidden lg:flex space-x-8 relative">
          {["Dashboard"].map((tab) => (
            <Link
              key={tab}
              href={`/${tab.toLowerCase().replace(" ", "")}`}
              className={`relative font-inter ${
                pathname === `/${tab.toLowerCase().replace(" ", "")}` || (tab === "Dashboard" && pathname === "/")
                  ? "text-black dark:text-white font-bold"
                  : "text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab}
              {(pathname === `/${tab.toLowerCase().replace(" ", "")}` || (tab === "Dashboard" && pathname === "/")) && (
                <span className="absolute left-0 right-0 bottom-[-30px] h-0.5 bg-black dark:bg-white"></span>
              )}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Insert token address, contract address, etc..."
              className="w-64 pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB734] focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-inter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width={20} height={20} />
          </div>
          <SignInButton />
          <button onClick={toggleTheme} className="focus:outline-none">
            {theme === "light" ? <MoonIcon className="w-6 h-6 text-gray-800" /> : <SunIcon className="w-6 h-6 text-yellow-400" />}
          </button>
        </div>
        <div className="lg:hidden flex items-center">
          <button onClick={toggleMenu} className="focus:outline-none">
            {isMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars4Icon className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="lg:hidden flex flex-col space-y-4 mt-4 font-inter">
          {["Dashboard"].map((tab) => (
            <Link
              key={tab}
              href={`/${tab.toLowerCase().replace(" ", "")}`}
              className={`relative ${
                pathname === `/${tab.toLowerCase().replace(" ", "")}` || (tab === "Dashboard" && pathname === "/")
                  ? "text-black dark:text-white font-bold"
                  : "text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              {tab}
            </Link>
          ))}
          <div className="relative">
            <input
              type="text"
              placeholder="Insert token address, contract address, etc..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FFB734] focus:border-transparent bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-inter"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" width={20} height={20} />
          </div>
          <SignInButton />
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className={`p-6 rounded-lg shadow-lg max-w-md w-full font-inter ${
            theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'
          }`}>
            <h2 className="text-xl font-semibold mb-4">Disclaimer</h2>
            <p className={`mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              This website is currently a development demo, and as such we do not suggest using it for real life tasks yet. There may be errors in data, or in functionality as we are still building
              it. Otherwise, feel free to look around...
            </p>
            <button 
              className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold py-2 px-4 rounded transition-colors duration-200" 
              onClick={() => setShowModal(false)}
            >
              I understand
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
