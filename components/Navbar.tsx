import React from 'react';
import Link from 'next/link';

const Navbar: React.FC = () => {
  const selected = "Pool Members"; // Example selected link

  return (
    <nav className="w-full bg-white shadow-md p-4 font-lora" style={{ boxShadow: "0px 2.72px 8px 0px rgba(0, 0, 0, 0.25)", borderBottom: "1px solid #C7C7C7" }}>
      <div className="max-w-screen-2xl mx-auto flex justify-between items-center relative">
        <div className="inline-flex items-center gap-2 font-lora">
          <img src="/images/logo.png" alt="Logo" className="h-8 w-auto" />
          <span className="text-xl font-bold">hoops</span>
        </div>
        <div className="flex space-x-4 relative">
          {["Dashboard", "Pool Members", "Governance"].map((link) => (
            <Link key={link} href={`/${link.toLowerCase().replace(" ", "-")}`} className={`relative text-gray-700 ${selected === link ? "text-black" : "text-gray-400"}`}>
              {link}
              {selected === link && (
                <span className="absolute left-0 right-0 bottom-[-26px] h-0.5 bg-black"></span>
              )}
            </Link>
          ))}
        </div>
        <div className="flex space-x-4 items-center">
          <span className="text-gray-700">Welcome, Jed</span>
          <button className="bg-white-500 text-white px-4 py-2 rounded"><span className="text-gray-700">GBSOI...PCHI</span></button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


