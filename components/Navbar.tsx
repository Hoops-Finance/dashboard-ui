"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bars4Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import "./Navbar/Navbar.css";
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
// import { useAuth } from "@/contexts/AuthContext";
import { ThemeSwitch } from "@/components/Navbar/ThemeSwitch.tsx";
// import { signOut as clientSignOut, useSession } from "next-auth/react";

/* 
 * We keep your original navigation arrays, comments, etc.
 */
const navigationItems = [
  // { name: "Home", path: "/ai-home" },
  // { name: "Chat", path: "/ai-chat" },
  { name: "Pools", path: "/pools" },
  { name: "Tokens", path: "/tokens" }
  // { name: "Strategies", path: "/strategies" },
  // { name: "Portfolio", path: "/portfolio" }
];

const navigationProfileItems = [
  { name: "Profile", path: "/profile" },
  { name: "Developer", path: "/developer" }
];

/*
  Props from the server:
  - sessionFromServer: user session object
  - logoutAction: server action for hidden form
*/
interface NavbarClientProps {
  sessionFromServer: any;
  logoutAction: (formData: FormData) => Promise<void>;
}

/* 
  1) DesktopNav:
     Renders the top navigation bar for large screens:
     - The center nav links (Pools/Tokens, etc.)
     - The right side (ThemeSwitch + user menu or login button).
*/
function DesktopNav(props: {
  isLoggedIn: boolean;
  session: any;
  onLogin: () => void;
  onLogout: () => void;
}) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <>
      {/* Center: Desktop Nav */}
      <div className="w-1/3 hidden lg:flex justify-center items-center gap-6">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`text-sm font-medium transition-colors ${
              pathname === item.path
                ? "text-black dark:text-white"
                : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
            }`}
          >
            {item.name}
          </Link>
        ))}
      </div>

      {/* Right side: Theme switch + user */}
      <div className="w-1/3 hidden lg:flex justify-end items-center gap-6">
        <ThemeSwitch isMobile={false} />

        {props.isLoggedIn ? (
          <UserMenu session={props.session} onLogout={props.onLogout} />
        ) : (
          <LoggedOutButtons onLogin={props.onLogin} />
        )}
      </div>
    </>
  );
}

/*
  2) UserMenu:
     Renders the avatar dropdown for a logged-in user
     (Profile, Developer, ConnectWallet, Log out).
*/
function UserMenu(props: { session: any; onLogout: () => void }) {
  const router = useRouter();

  return (
    <div className="flex-center-g-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-10 w-10 rounded-full">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="AvatarFallback">
                {props.session.user.email.charAt(0).toUpperCase()}
              </AvatarFallback>
              <AvatarImage />
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <div className="flex items-center justify-start gap-2 p-2">
            <div className="flex flex-col space-y-1 leading-none">
              <p className="font-medium text-sm text-gray-900 dark:text-white">
                Welcome back
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400" >
                {props.session.user.email}
              </p>
            </div>
          </div>
          <DropdownMenuSeparator />
          {navigationProfileItems.map((item) => (
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => router.push(item.path)}
              key={item.name}
            >
              {item.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <div className="p-2">
            <ConnectWallet />
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="cursor-pointer text-red-500 focus:text-red-500"
            onClick={props.onLogout}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

/*
  3) LoggedOutButtons:
     Renders the 'Login' + 'Sign Up' buttons when no user is logged in.
*/
function LoggedOutButtons(props: { onLogin: () => void }) {

  return (
    <div className="flex-center-g-4">
      <button
        onClick={props.onLogin}
        className="text-sm font-medium transition-colors text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
      >
        Login
      </button>
      <Link
        href="/signup"
        className="px-4 py-2 text-sm font-medium rounded-lg transition-colors bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
      >
        Sign up
      </Link>
    </div>
  );
}

/*
  4) MobileNav:
     Renders the theme switch and hamburger for small screens.
*/
function MobileNav(props: { isMenuOpen: boolean; toggleMenu: () => void }) {
  return (
    <div className="lg:hidden">
      <ThemeSwitch isMobile={true} />
      <button
        onClick={props.toggleMenu}
        className="p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
        aria-label="Toggle menu"
      >
        {props.isMenuOpen ? (
          <XMarkIcon
            className="w-6 h-6 text-black dark:text-white"/>
        ) : (
          <Bars4Icon className="w-6 h-6 text-black dark:text-white"/>
        )}
      </button>
    </div>
  );
}

/*
  5) MobileMenuPanel:
     The panel that shows up for small screens with the nav links.
*/
function MobileMenuPanel(props: {
  isMenuOpen: boolean;
  closeMenu: () => void;
  isLoggedIn: boolean;
  session: any;
  onLogin: () => void;
  onLogout: () => void;
}) {
  //const router = useRouter();
  const pathname = usePathname();

  if (!props.isMenuOpen) return null;

  return (
    <div className="lg:hidden border-t bg-white border-gray-200 dark:bg-background dark:border-border">
      <div className="max-w-screen-2xl mx-auto px-4 py-4 flex flex-col gap-4">
        {navigationItems.map((item) => (
          <Link
            key={item.name}
            href={item.path}
            className={`text-sm font-medium transition-colors ${
              pathname === item.path
                ? "text-black dark:text-white"
                : "text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
            }`}
            onClick={props.closeMenu}
          >
            {item.name}
          </Link>
        ))}

        {props.isLoggedIn ? (
          <>
            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              {navigationProfileItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.path}
                  className={`text-sm font-medium transition-colors
                  dark:text-gray-400 dark:hover:text-white
                  text-gray-600 hover:text-black
                  ${
                    pathname === item.path
                    ? "dark:text-white text-black"
                    : ""
                  }`
                  }
                  onClick={props.closeMenu}
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              <ConnectWallet />
            </div>
            <div className="flex flex-col gap-4 pt-4 border-t border-border">
                <button
                onClick={() => {
                  props.onLogout();
                  props.closeMenu();
                }}
                className="text-sm font-medium transition-colors text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                >
                Log out
                </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 pt-4 border-t border-border">
            <button
              onClick={() => {
              props.onLogin();
              props.closeMenu();
              }}
              className="text-sm font-medium transition-colors text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
            >
              Login
            </button>
            <Link
              href="/signup"
              onClick={props.closeMenu}
              className="px-4 py-2 text-sm font-medium rounded-lg text-center transition-colors bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

/*
  6) Main exported component: your big Navbar. 
     We reassemble the subcomponents (DesktopNav, MobileNav, etc.)
*/
const Navbar: FC<NavbarClientProps> = ({ sessionFromServer, logoutAction }) => {
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // We no longer rely on useSession, we read from sessionFromServer:
  const session = sessionFromServer;
  const isLoggedIn = !!session?.user?.accessToken;

  const handleMenuMobile = () => {
    if (isMenuOpen) setIsMenuOpen(false);
  };

  const handleLogin = () => {
    handleMenuMobile();
    router.push("/signup?mode=login");
  };

  const handleLogout = () => {
    const formElem = document.getElementById("logout-hidden-form") as HTMLFormElement;
    if (formElem) formElem.requestSubmit();
  };

  return (
    <nav
      className="sticky top-0 w-full border-b bg-white border-gray-200 dark:bg-background dark:border-border z-50"
    >
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="w-1/3 relative flex items-center">
        <div style={{ width: "120px", height: "46px", position: "relative" }}>
        <Image
          src="/images/logo2.svg"
          alt="Hoops Logo"
          fill={true}
          className="brightness-0 dark:invert"
          priority
        />
        </div>
      </Link>

      {/* Desktop Nav */}
      <DesktopNav
        isLoggedIn={isLoggedIn}
        session={session}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />

      {/* Mobile: theme switch & hamburger */}
      <MobileNav
        isMenuOpen={isMenuOpen}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
      />
      </div>

      {/* Mobile expanded menu */}
      <MobileMenuPanel
      isMenuOpen={isMenuOpen}
      closeMenu={() => setIsMenuOpen(false)}
      isLoggedIn={isLoggedIn}
      session={session}
      onLogin={handleLogin}
      onLogout={handleLogout}
      />

      <form
      id="logout-hidden-form"
      action={logoutAction}
      style={{ display: "none" }}
      />
    </nav>
  );
};

export default Navbar;
