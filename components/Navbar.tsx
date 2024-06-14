"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Navbar: React.FC = () => {
  const pathname = usePathname(); // Get the current path

  return (
    <nav className="w-full bg-white shadow-md p-4 font-lora" style={{ boxShadow: "0px 2.72px 8px 0px rgba(0, 0, 0, 0.25)", borderBottom: "1px solid #C7C7C7" }}>
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center relative">
        <div className="inline-flex items-center gap-2 font-lora">
          <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-bold">hoops</span>
        </div>
        <div className="flex space-x-8 relative">
          <Link href="/dashboard" className={`relative ${pathname === '/app/dashboard' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Dashboard
            {pathname === '/dashboard' && (
              <span className="absolute left-0 right-0 bottom-[-4px] h-0.5 bg-black"></span>
            )}
          </Link>
          <Link href="/pool-members" className={`relative ${pathname === '/pool-members' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Pool Members
            {pathname === '/pool-members' && (
              <span className="absolute left-0 right-0 bottom-[-4px] h-0.5 bg-black"></span>
            )}
          </Link>
          <Link href="/governance" className={`relative ${pathname === '/governance' ? "text-black font-bold" : "text-gray-400"} hover:text-gray-600`}>
            Governance
            {pathname === '/governance' && (
              <span className="absolute left-0 right-0 bottom-[-4px] h-0.5 bg-black"></span>
            )}
          </Link>
        </div>
        <div className="flex space-x-4 items-center">
          <div className="flex items-center p-2 pl-8 pr-8 rounded-lg border-2 border-gray-300 hover:bg-gray-100 transition duration-300" style={{ borderRadius: "16px", boxShadow: "0px 184px 52px 0px rgba(0, 0, 0, 0.00), 0px 118px 47px 0px rgba(0, 0, 0, 0.00), 0px 66px 40px 0px rgba(0, 0, 0, 0.00), 0px 29px 29px 0px rgba(0, 0, 0, 0.00), 0px 7px 16px 0px rgba(0, 0, 0, 0.00)" }}>
            <span className="text-gray-700">Welcome, Jed</span>
            <div className="h-8 border-l-2 border-gray-300 mx-4"></div>
            <button className="bg-white-500 text-white px-4 py-2 rounded"><span className="text-gray-700">GBSOI...PCHI</span></button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
