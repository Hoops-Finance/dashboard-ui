"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bars4Icon, XMarkIcon, SunIcon, MoonIcon, UserCircleIcon } from "@heroicons/react/24/outline";
import { useTheme } from "./ThemeContext";

import Image from "next/image";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConnectWallet } from "@/components/ConnectWallet";
import { signOut, useSession } from "next-auth/react";

const navigationItems = [
  { name: "Home", path: "/ai-home" },
  { name: "Chat", path: "/ai-chat" },
  { name: "Pools", path: "/pools" },
  { name: "Tokens", path: "/tokens" },
  { name: "Strategies", path: "/strategies" },
  { name: "Portfolio", path: "/portfolio" }
];

const Navbar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { data: session, status } = useSession(); // get the client session

  useEffect(() => {
    if (status !== "loading") {
      if (session?.user?.accessToken) {
        setIsLoggedIn(true);
      }
    }
  }, [status]);

  const handleLogin = () => {
    router.push("/signup?mode=login");
  };

  const handleLogout = () => {
    signOut();
    router.push("/");
  };

  return (
    <nav
      className={`sticky top-0 w-full border-b ${theme === "dark" ? "bg-background border-border" : "bg-white border-gray-200"} z-50`}
    >
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="relative flex items-center">
          <Image
            src="/images/logo2.svg"
            alt="Hoops Logo"
            width={120}
            height={40}
            className={`h-8 w-auto ${theme === "dark" ? "brightness-0 invert" : "brightness-0"}`}
            priority
          />
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`text-sm font-medium transition-colors ${
                pathname === item.path
                  ? theme === "dark"
                    ? "text-white"
                    : "text-black"
                  : theme === "dark"
                    ? "text-gray-400 hover:text-white"
                    : "text-gray-600 hover:text-black"
              }`}
            >
              {item.name}
            </Link>
          ))}

          {isLoggedIn ? (
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="/images/avatar-test.png" alt="User" />
                      <AvatarFallback>
                        <UserCircleIcon className="h-6 w-6" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
                        Welcome back
                      </p>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/developer")}>
                    Developer
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <div className="p-2">
                    <ConnectWallet />
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-500 focus:text-red-500" onClick={handleLogout}>
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <button
                onClick={handleLogin}
                className={`text-sm font-medium transition-colors ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
              >
                Login
              </button>
              <Link
                href="/signup"
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${theme === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"}`}
              >
                Sign up
              </Link>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
            aria-label="Toggle theme"
          >
            {theme === "light" ? (
              <MoonIcon className={"w-5 h-5 text-gray-600"} />
            ) : (
              <SunIcon className={"w-5 h-5 text-gray-400"} />
            )}
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={`lg:hidden p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? (
            <XMarkIcon className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-black"}`} />
          ) : (
            <Bars4Icon className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-black"}`} />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div
          className={`lg:hidden border-t ${theme === "dark" ? "bg-background border-border" : "bg-white border-gray-200"}`}
        >
          <div className="max-w-screen-2xl mx-auto px-4 py-4 flex flex-col gap-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.path
                    ? theme === "dark"
                      ? "text-white"
                      : "text-black"
                    : theme === "dark"
                      ? "text-gray-400 hover:text-white"
                      : "text-gray-600 hover:text-black"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isLoggedIn ? (
              <div className="flex flex-col gap-4 pt-4 border-t border-border">
                <button
                  onClick={handleLogout}
                  className={`text-sm font-medium transition-colors ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
                >
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pt-4 border-t border-border">
                <button
                  onClick={handleLogin}
                  className={`text-sm font-medium transition-colors ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}
                >
                  Login
                </button>
                <Link
                  href="/signup"
                  className={`px-4 py-2 text-sm font-medium rounded-lg text-center transition-colors ${
                    theme === "dark" ? "bg-white text-black hover:bg-gray-200" : "bg-black text-white hover:bg-gray-800"
                  }`}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
