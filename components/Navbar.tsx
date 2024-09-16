// components/Navbar.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MoonIcon, SunIcon } from '@heroicons/react/solid';
import { useTheme } from 'next-themes';

const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleDarkMode = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  if (!mounted) return null; // Prevents hydration mismatch

  return (
    <nav className="navbar w-full shadow-md p-4 fixed top-0 left-0 right-0 z-50">
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center relative px-6">
        {/* Brand Logo */}
        <div className="inline-flex items-center gap-2">
          <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="font-bold text-2xl">Hoops</span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden lg:flex space-x-8">
          <Link
            href="/markets"
            className={`nav-link ${
              pathname === '/markets' ? 'nav-link-active' : ''
            }`}
          >
            Markets
          </Link>
          <Link
            href="/pools"
            className={`nav-link ${
              pathname === '/pools' ? 'nav-link-active' : ''
            }`}
          >
            Pools
          </Link>
          <Link
            href="/tokens"
            className={`nav-link ${
              pathname === '/tokens' ? 'nav-link-active' : ''
            }`}
          >
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
            {theme === 'dark' ? (
              <SunIcon className="h-6 w-6 text-yellow-500" />
            ) : (
              <MoonIcon className="h-6 w-6 text-gray-500" />
            )}
          </button>

          {/* Login / Signup */}
          <button className="btn-primary">Login</button>
          <button className="btn-primary">Sign Up</button>
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center">
          <button className="focus:outline-none" onClick={toggleMobileMenu}>
            <img src="/icons/menu.svg" alt="Menu" className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-light-bg dark:bg-bg shadow-md p-4">
          <div className="flex flex-col space-y-4">
            <Link
              href="/markets"
              className={`nav-link ${
                pathname === '/markets' ? 'nav-link-active' : ''
              }`}
            >
              Markets
            </Link>
            <Link
              href="/pools"
              className={`nav-link ${
                pathname === '/pools' ? 'nav-link-active' : ''
              }`}
            >
              Pools
            </Link>
            <Link
              href="/tokens"
              className={`nav-link ${
                pathname === '/tokens' ? 'nav-link-active' : ''
              }`}
            >
              Tokens
            </Link>
            {/* Light/Dark Mode Toggle */}
            <button
              className="text-sm p-2 bg-gray-200 dark:bg-gray-700 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition duration-300"
              onClick={toggleDarkMode}
            >
              {theme === 'dark' ? (
                <SunIcon className="h-6 w-6 text-yellow-500" />
              ) : (
                <MoonIcon className="h-6 w-6 text-gray-500" />
              )}
            </button>
            {/* Login / Signup */}
            <button className="btn-primary">Login</button>
            <button className="btn-primary">Sign Up</button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
