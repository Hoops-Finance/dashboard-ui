"use client";

import { FC, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bars4Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useTheme } from "@/contexts/ThemeContext";
import Image from "next/image";
import "./Navbar.css";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ConnectWallet } from "@/components/ConnectWallet";
// import { useAuth } from "@/contexts/AuthContext";
import { ThemeSwitch } from "@/components/Navbar/ThemeSwitch.tsx";
import { signOut as clientSignOut, useSession } from "next-auth/react";

const navigationItems = [
  { name: "Home", path: "/ai-home" },
  { name: "Chat", path: "/ai-chat" },
  { name: "Pools", path: "/pools" },
  { name: "Tokens", path: "/tokens" },
  { name: "Strategies", path: "/strategies" },
  { name: "Portfolio", path: "/portfolio" }
];

const Navbar: FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, toggleTheme }: { theme: "light" | "dark"; toggleTheme: () => void } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // const { session } = useAuth();
  console.log("using session in client side in navbar");
  const { data: session, status } = useSession();
  console.log("used session in client side in navbar");

  const isLoggedIn = !!session?.user.accessToken;

  const handleLogin = () => {
    handleMenuMobile();
    router.push("/signup?mode=login");
  };

  const handleLogout = async () => {
    try {
      console.log("[Navbar] Logging out...");
      await clientSignOut({ redirect: false });
      console.log("[Navbar] Successfully signed out");
      router.push("/"); // Handle redirect manually
    } catch (error) {
      console.error("[Navbar] Error during sign-out:", error);
    }
  };

  const handleMenuMobile = () => {
    if (isMenuOpen) {
      setIsMenuOpen(false);
    }
  };

  return (
    <nav className={`sticky top-0 w-full border-b ${theme === "dark" ? "bg-background border-border" : "bg-white border-gray-200"} z-50`}>
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="relative flex items-center">
          <div style={{ width: "120px", height: "40px", position: "relative" }}>
            <Image src="/images/logo2.svg" alt="Hoops Logo" fill={true} className={`brightness-0 ${theme === "dark" ? "invert" : ""}`} priority />
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`text-sm font-medium transition-colors ${
                pathname === item.path ? (theme === "dark" ? "text-white" : "text-black") : theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
              } ${item.name !== "Pools" && item.name !== "Tokens" ? "hidden" : ""}`}
            >
              {item.name}
            </Link>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-6">
          <ThemeSwitch isMobile={false} />

          {isLoggedIn ? (
            <div className="flex-center-g-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="AvatarFallback">{(session.user.email || "Hoop").charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className={`font-medium text-sm ${theme === "dark" ? "text-white" : "text-gray-900"}`}>Welcome back</p>
                      <p className={`text-xs ${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>{session.user.email}</p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      router.push("/profile");
                    }}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      router.push("/developer");
                    }}
                  >
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
            <div className="flex-center-g-4">
              <button onClick={handleLogin} className={`text-sm font-medium transition-colors ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}>
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
        </div>

        {/* Mobile Menu Button */}
        <div className={"lg:hidden"}>
          <ThemeSwitch isMobile={true} />

          <button
            onClick={() => {
              setIsMenuOpen(!isMenuOpen);
            }}
            className={`p-2 rounded-lg transition-colors ${theme === "dark" ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <XMarkIcon className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-black"}`} /> : <Bars4Icon className={`w-6 h-6 ${theme === "dark" ? "text-white" : "text-black"}`} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className={`lg:hidden border-t ${theme === "dark" ? "bg-background border-border" : "bg-white border-gray-200"}`}>
          <div className="max-w-screen-2xl mx-auto px-4 py-4 flex flex-col gap-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.path}
                className={`text-sm font-medium transition-colors ${
                  pathname === item.path ? (theme === "dark" ? "text-white" : "text-black") : theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {isLoggedIn ? (
              <div className="flex flex-col gap-4 pt-4 border-t border-border">
                <button onClick={handleLogout} className={`text-sm font-medium transition-colors ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}>
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-4 pt-4 border-t border-border">
                <button onClick={handleLogin} className={`text-sm font-medium transition-colors ${theme === "dark" ? "text-gray-400 hover:text-white" : "text-gray-600 hover:text-black"}`}>
                  Login
                </button>
                <Link
                  href="/signup"
                  onClick={() => {
                    handleMenuMobile();
                  }}
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
