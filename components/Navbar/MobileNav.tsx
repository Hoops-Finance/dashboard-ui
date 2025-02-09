// @/components/Navbar/MobileNav.tsx
// No "use client" => purely server using checkbox hack
import { Suspense } from "react";
import Link from "next/link";
import { navigationItems, navigationProfileItems } from "./Constants";
import { ConnectWallet } from "@/components/ConnectWallet";
import { ThemeSwitch } from "./ThemeSwitch";
import PathLink from "./PathLink";

interface MobileNavProps {
  isLoggedIn: boolean;
  session: any;
}

export default function MobileNav({ isLoggedIn, session }: MobileNavProps) {
  const userEmail = isLoggedIn ? session.user.email : "";

  return (
    <>
      {/* The hidden checkbox + label for mobile hamburger */}
      <input type="checkbox" id="mobile-toggle" className="peer hidden" />
      <label
        htmlFor="mobile-toggle"
        className="lg:hidden p-2 rounded-lg transition-colors 
                   hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
      >
        {/* A simple bars icon */}
        <svg
          className="w-6 h-6 text-black dark:text-white"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </label>

      {/* The mobile menu container, hidden by default, shown if peer-checked */}
      <div
        className={`
          hidden
          peer-checked:flex
          lg:hidden
          flex-col
          border-t border-gray-200 dark:border-border
          bg-white dark:bg-background 
          px-4 py-4
        `}
      >
        {/* We can put theme switch, maybe a greeting if logged in */}
        <div className="flex items-center gap-4 mb-4">
          <ThemeSwitch isMobile={true} />
          {isLoggedIn && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Hi {userEmail}
            </span>
          )}
        </div>

        {/* Main nav items */}
        {navigationItems.map((item) => (
          <Suspense
            key={item.path}
            fallback={
              <Link
                href={item.path}
                className="text-sm font-medium transition-colors text-black dark:text-white"
              >
                {item.name}
              </Link>
            }
          >
            <PathLink
              name={item.name}
              path={item.path}
              baseClassName="text-sm font-medium transition-colors"
              activeClassName="text-black dark:text-white"
              fallbackClassName="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
            />
          </Suspense>
        ))}

        {isLoggedIn ? (
          <>
            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              {navigationProfileItems.map((item) => (
                <Suspense
                  key={item.path}
                  fallback={
                    <Link
                      href={item.path}
                      className="text-sm font-medium transition-colors text-black dark:text-white"
                    >
                      {item.name}
                    </Link>
                  }
                >
                  <PathLink
                    name={item.name}
                    path={item.path}
                    baseClassName="text-sm font-medium transition-colors"
                    activeClassName="text-black dark:text-white"
                    fallbackClassName="text-gray-600 hover:text-black dark:text-gray-400 dark:hover:text-white"
                  />
                </Suspense>
              ))}
            </div>
            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              <ConnectWallet />
            </div>
            <div className="flex flex-col gap-4 pt-4 border-t border-border">
              {/* We do a form for logout -> no onClick needed => pure server */}
              <form action="#logoutAction" method="POST" onSubmit={(e) => e.preventDefault()}>
                <button
                  form="logout-hidden-form"
                  type="submit"
                  className="text-sm font-medium transition-colors
                             text-gray-600 hover:text-black
                             dark:text-gray-400 dark:hover:text-white"
                >
                  Log out
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 pt-4 border-t border-border">
            <Link
              href="/signup?mode=login"
              className="text-sm font-medium transition-colors 
                         text-gray-600 hover:text-black 
                         dark:text-gray-400 dark:hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-sm font-medium rounded-lg text-center transition-colors 
                         bg-black text-white hover:bg-gray-800 
                         dark:bg-white dark:text-black dark:hover:bg-gray-200"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>
    </>
  );
}
