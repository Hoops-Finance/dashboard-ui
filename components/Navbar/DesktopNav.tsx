// @/components/Navbar/DesktopNav.tsx
// No "use client" => purely server
import { Suspense } from "react";
import Link from "next/link";
import { ThemeSwitch } from "./ThemeSwitch"; // if this is also server or a small client piece, it's okay
import { UserMenu } from "./UserMenu"; // We'll import the client subcomponent
import { navigationItems } from "./Constants";
import PathLink from "./PathLink"; // Marked client

interface DesktopNavProps {
  isLoggedIn: boolean;
  session: any;
}

export default function DesktopNav({ isLoggedIn, session }: DesktopNavProps) {
  const userEmail = isLoggedIn ? session.user.email : "";

  return (
    <>
      {/* Middle nav items */}
      <div className="w-1/3 hidden lg:flex justify-center items-center gap-6">
        {navigationItems.map((item) => (
          <Suspense
            key={item.name}
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

      {/* Right side (theme switch + user menu or login) */}
      <div className="w-1/3 hidden lg:flex justify-end items-center gap-6">
        <ThemeSwitch isMobile={false} />

        {isLoggedIn ? (
          <UserMenu userEmail={userEmail} />
        ) : (
          <Link
            href="/signup?mode=login"
            className="text-sm font-medium transition-colors 
                       text-gray-600 hover:text-black 
                       dark:text-gray-400 dark:hover:text-white"
          >
            Login
          </Link>
        )}
      </div>
    </>
  );
}
