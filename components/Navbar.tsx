"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ConnectWallet } from './ConnectWallet';

const Navbar: React.FC = () => {
  const pathname = usePathname(); // Get the current path
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="w-full bg-white shadow-md p-4 font-lora fixed top-0 left-0 right-0 z-50" style={{ boxShadow: "0px 2.72px 8px 0px rgba(0, 0, 0, 0.25)", borderBottom: "1px solid #C7C7C7" }}>
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center relative px-6">
        <div className="inline-flex items-center gap-2 font-lora">
          <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-bold">hoops</span>
        </div>
        <div className="hidden lg:flex space-x-8 relative">
          <Link href="/dashboard2" className={`relative ${pathname === '/dashboard2' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Dashboard
            {pathname === '/dashboard2' && (
              <span className="absolute left-0 right-0 bottom-[-30px] h-0.5 bg-black"></span>
            )}
          </Link>
          <Link href="/pooldata" className={`relative ${pathname === '/pooldata' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Pool Data
            {pathname === '/pooldata' && (
              <span className="absolute left-0 right-0 bottom-[-30px] h-0.5 bg-black"></span>
            )}
          </Link>
          <Link href="/swap" className={`relative ${pathname === '/swap' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Swaps
            {pathname === '/swap' && (
              <span className="absolute left-0 right-0 bottom-[-30px] h-0.5 bg-black"></span>
            )}
          </Link>
        </div>
        <div className="hidden lg:flex space-x-4 items-center">
          <ConnectWallet />
        </div>
        <div className="lg:hidden flex items-center">
          <button onClick={toggleMenu} className="focus:outline-none">
            <img src="/icons/accordion.svg" alt="Menu" className="h-6 w-6" />
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="lg:hidden flex flex-col space-y-4 mt-4">
          <Link href="/dashboard2" className={`relative ${pathname === '/dashboard2' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Dashboard
          </Link>
          <Link href="/pooldata" className={`relative ${pathname === '/pooldata' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Pool Data
          </Link>
          <Link href="/swap" className={`relative ${pathname === '/swap' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Swaps
          </Link>
          <ConnectWallet />
        </div>
      )}
    </nav>
  );
};

export default Navbar;
