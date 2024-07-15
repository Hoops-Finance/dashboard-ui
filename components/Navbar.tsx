"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
          <Link href="/dashboard" className={`relative ${pathname === '/app/dashboard' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Dashboard
            {pathname === '/dashboard' && (
              <span className="absolute left-0 right-0 bottom-[-30px] h-0.5 bg-black"></span>
            )}
          </Link>
          <Link href="/pools" className={`relative ${pathname === '/pools' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
              Pools
            {pathname === '/pools' && (
              <span className="absolute left-0 right-0 bottom-[-30px] h-0.5 bg-black"></span>
            )}
          </Link>
          <Link href="/governance" className={`relative ${pathname === '/governance' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Governance
            {pathname === '/governance' && (
              <span className="absolute left-0 right-0 bottom-[-30px] h-0.5 bg-black"></span>
            )}
          </Link>
        </div>
        <div className="hidden lg:flex space-x-4 items-center">
          <div className="flex text-sm items-center pl-8 pr-8 p-1 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition duration-300" style={{ borderRadius: "16px", boxShadow: "0px 184px 52px 0px rgba(0, 0, 0, 0.00), 0px 118px 47px 0px rgba(0, 0, 0, 0.00), 0px 66px 40px 0px rgba(0, 0, 0, 0.00), 0px 29px 29px 0px rgba(0, 0, 0, 0.00), 0px 7px 16px 0px rgba(0, 0, 0, 0.00)", letterSpacing: "2px", fontFamily: "Inter, sans-serif"}}>
            <span className="text-gray-700">Welcome, Jed</span>
            <div className="h-8 border-l-2 border-gray-300 mx-4"></div>
            <button className="bg-white-500 text-white px-4 py-2 rounded"><span className="text-gray-700">GBSOI...PCHI</span></button>
          </div>
        </div>
        <div className="lg:hidden flex items-center">
          <button onClick={toggleMenu} className="focus:outline-none">
            <img src="/icons/accordion.svg" alt="Menu" className="h-6 w-6" />
          </button>
        </div>
      </div>
      {isMenuOpen && (
        <div className="lg:hidden flex flex-col space-y-4 mt-4">
          <Link href="/dashboard" className={`relative ${pathname === '/app/dashboard' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Dashboard
          </Link>
          <Link href="/pools" className={`relative ${pathname === '/pools' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Pools
          </Link>
          <Link href="/governance" className={`relative ${pathname === '/governance' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Governance
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
