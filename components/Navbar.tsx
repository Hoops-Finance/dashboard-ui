"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bars4Icon, XMarkIcon, SunIcon, MoonIcon } from "@heroicons/react/24/outline";
import { useTheme } from "./ThemeContext";

const navigationItems = [
  { name: "Home", path: "/ai-home" },
  { name: "Chat", path: "/ai-chat" },
  { name: "Pools", path: "/pools" },
  { name: "Tokens", path: "/tokens" },
  { name: "Strategies", path: "/strategies" },
  { name: "Portfolio", path: "/portfolio" },
];

const Navbar: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const handleLogin = () => {
    router.push("/signup?mode=login");
  };

  return (
    <nav className="w-full bg-background fixed top-0 left-0 right-0 z-50 border-b border-border h-[72px]">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between px-4 md:px-6 py-4">
        {/* Logo */}
        <Link href="/ai" className="flex items-center">
          <svg 
            width="40" 
            height="40" 
            viewBox="0 0 512 512" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform hover:scale-105"
          >
            <g clipPath="url(#clip0_486_842)">
              <rect x="-1" width="513" height="513" rx="32" className="fill-background"/>
              <path 
                fillRule="evenodd" 
                clipRule="evenodd" 
                d="M113.11 352.355C129.23 360.785 147.295 365 167.305 365C187.594 365 205.52 360.513 221.083 351.539C235.138 343.19 246.473 331.736 255.089 317.177C264.493 332.33 277.131 344.056 293.001 352.355C309.121 360.785 327.185 365 347.196 365C367.484 365 385.41 360.513 400.974 351.539C416.538 342.294 428.766 329.241 437.66 312.382C446.553 295.522 451 275.671 451 252.829C451 231.075 446.414 212.447 437.243 196.947C428.071 181.175 415.565 169.075 399.723 160.645C383.882 152.215 365.956 148 345.945 148C327.046 148 309.537 152.759 293.418 162.276C278.949 170.721 267.031 182.454 257.663 197.476C257.56 197.3 257.456 197.123 257.352 196.947C248.181 181.175 235.674 169.075 219.833 160.645C203.991 152.215 186.065 148 166.055 148C147.156 148 129.647 152.759 113.527 162.276C97.6858 171.522 84.9013 184.71 75.174 201.842C65.7247 218.702 61 238.417 61 260.987C61 282.197 65.5857 300.689 74.7572 316.461C84.2065 331.961 96.991 343.925 113.11 352.355ZM257.663 197.476C256.774 198.902 255.908 200.357 255.065 201.842C245.615 218.702 240.891 238.417 240.891 260.987C240.891 282.197 245.476 300.689 254.648 316.461C254.794 316.7 254.941 316.939 255.089 317.177C256.014 315.615 256.907 314.016 257.769 312.382C266.663 295.522 271.109 275.671 271.109 252.829C271.109 231.321 266.627 212.871 257.663 197.476ZM193.986 324.618C188.428 331.96 180.09 335.768 168.973 336.039C157.578 336.311 148.407 332.232 141.459 323.803C134.788 315.101 129.925 304.088 126.868 290.763C123.81 277.439 122.282 263.842 122.282 249.974C122.282 238.009 123.533 226.588 126.034 215.711C128.813 204.561 133.26 195.316 139.374 187.974C145.766 180.632 154.382 176.825 165.221 176.553C173.559 176.281 180.507 178.728 186.065 183.895C191.902 189.061 196.487 195.86 199.822 204.289C203.157 212.719 205.52 222.101 206.909 232.434C208.577 242.768 209.411 252.965 209.411 263.026C209.411 274.447 208.299 285.732 206.076 296.882C203.852 308.031 199.822 317.276 193.986 324.618ZM373.876 324.618C368.318 331.96 359.98 335.768 348.863 336.039C337.469 336.311 328.297 332.232 321.349 323.803C314.679 315.101 309.815 304.088 306.758 290.763C303.701 277.439 302.172 263.842 302.172 249.974C302.172 238.009 303.423 226.588 305.924 215.711C308.704 204.561 313.15 195.316 319.265 187.974C325.657 180.632 334.273 176.825 345.111 176.553C353.449 176.281 360.397 178.728 365.956 183.895C371.792 189.061 376.378 195.86 379.713 204.289C383.048 212.719 385.41 222.101 386.8 232.434C388.467 242.768 389.301 252.965 389.301 263.026C389.301 274.447 388.19 285.732 385.966 296.882C383.743 308.031 379.713 317.276 373.876 324.618Z" 
                className="fill-foreground"
              />
            </g>
            <defs>
              <clipPath id="clip0_486_842">
                <rect width="512" height="512" fill="white"/>
              </clipPath>
            </defs>
          </svg>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center gap-6">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`text-sm font-medium transition-colors ${
                pathname === item.path
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.name}
            </Link>
          ))}
          <div className="flex items-center gap-4">
            <button
              onClick={handleLogin}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Login
            </button>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Sign up
            </Link>
            <button 
              onClick={toggleTheme} 
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <MoonIcon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <SunIcon className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="lg:hidden p-2 hover:bg-muted rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <XMarkIcon className="w-6 h-6 text-foreground" />
          ) : (
            <Bars4Icon className="w-6 h-6 text-foreground" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="max-w-screen-2xl mx-auto px-4 py-4 flex flex-col gap-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {item.name}
              </Link>
            ))}
            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              <button
                onClick={handleLogin}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </button>
              <Link
                href="/signup"
                className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-center"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
