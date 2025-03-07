"use client";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { navigationProfileItems } from "./Constants";
import Link from "next/link";
//import { ConnectWallet } from "@/components/ConnectWallet";

interface UserMenuProps {
  userEmail: string;
}

export function UserMenu({ userEmail }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="AvatarFallback">
              {userEmail.charAt(0).toUpperCase()}
            </AvatarFallback>
            <AvatarImage />
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm text-gray-900 dark:text-white">Welcome back</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{userEmail}</p>
          </div>
        </div>
        <DropdownMenuSeparator />
        {navigationProfileItems.map((item) => (
          <DropdownMenuItem key={item.name} className="cursor-pointer">
            <Link href={item.path}>{item.name}</Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="p-2">{/* <ConnectWallet /> */}</div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-red-500 focus:text-red-500"
          // For logout, we reference the same hidden form
          onClick={() => {
            const formElem = document.getElementById("logout-hidden-form") as HTMLFormElement | null;
            if (formElem) formElem.requestSubmit();
          }}
        >
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
