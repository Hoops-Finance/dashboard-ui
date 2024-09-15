'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoonIcon, SunIcon } from '@heroicons/react/solid'; // Use Heroicons for the moon/sun icons

const Navbar: React.FC = () => {
  const pathname = usePathname(); // Get the current path
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Adjust text size and mobile/desktop based on screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // Adjust for mobile view
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Apply the initial dark mode preference from system
    const darkModePreference = window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDarkMode(darkModePreference);
    document.documentElement.classList.toggle("dark", darkModePreference);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prevMode) => !prevMode);
    document.documentElement.classList.toggle('dark', !darkMode); // Toggle dark mode
  };

  return (
    <nav className="w-full bg-white dark:bg-gray-900 shadow-md p-4 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center relative px-6">
        {/* Brand Logo */}
        <div className="inline-flex items-center gap-2">
          <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
          <span className={`font-bold ${isMobile ? 'text-lg' : 'text-2xl'}`}>Hoops</span>
        </div>

        {/* Navigation Links */}
        <div className="hidden lg:flex space-x-8 relative">
          <Link href="/markets" className={`relative ${pathname === '/markets' ? 'font-bold text-black dark:text-white' : 'text-gray-400'} hover:text-gray-600`}>
            Markets
          </Link>
          <Link href="/pools" className={`relative ${pathname === '/pools' ? 'font-bold text-black dark:text-white' : 'text-gray-400'} hover:text-gray-600`}>
            Pools
          </Link>
          <Link href="/tokens" className={`relative ${pathname === '/tokens' ? 'font-bold text-black dark:text-white' : 'text-gray-400'} hover:text-gray-600`}>
            Tokens
          </Link>
        </div>

        {/* Light/Dark Mode Toggle + Login/Signup */}
        <div className="hidden lg:flex space-x-4 items-center">
          {/* Light/Dark Mode Toggle */}
          <button
            className="text-sm p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
            onClick={toggleDarkMode}
          >
            {darkMode ? (
              <SunIcon className="h-6 w-6 text-yellow-500" />
            ) : (
              <MoonIcon className="h-6 w-6 text-gray-500" />
            )}
          </button>

          {/* Login / Signup */}
          <button className="text-sm bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300">
            Login
          </button>
          <button className="text-sm bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition duration-300">
            Sign Up
          </button>
        </div>

        {/* Mobile Menu (if needed) */}
        <div className="lg:hidden flex items-center">
          {/* Mobile Menu Button */}
          <button className="focus:outline-none">
            <img src="/icons/menu.svg" alt="Menu" className="h-6 w-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
