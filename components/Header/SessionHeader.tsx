"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "../ThemeContext";
import { useSession, signOut } from "next-auth/react";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { ConnectWallet } from "@/components/ConnectWallet";

export const SessionHeader: React.FC = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const { data: session, status } = useSession();  // get the client session

  useEffect(() => {
    if(status !== "loading") {
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
    <>
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
                  <p className={`font-medium text-sm ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Welcome back
                  </p>
                  <p className={`text-xs ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {session?.user?.email}
                  </p>
                </div>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => router.push("/developer")}
              >
                Developer
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <div className="p-2">
                <ConnectWallet />
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="cursor-pointer text-red-500 focus:text-red-500"
                onClick={handleLogout}
              >
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={handleLogin}
            className={`text-sm font-medium transition-colors ${
              theme === 'dark'
                ? 'text-gray-400 hover:text-white'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            Login
          </button>
          <Link
            href="/signup"
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              theme === 'dark'
                ? 'bg-white text-black hover:bg-gray-200'
                : 'bg-black text-white hover:bg-gray-800'
            }`}
          >
            Sign up
          </Link>
        </div>
      )}
    </>
  );
};
