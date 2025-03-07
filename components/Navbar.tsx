// app/components/Navbar.tsx
"use client";
export const experimental_ppr = true;

import { FC, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { logoutAction } from "@/actions/logout";
import DesktopNav from "@/components/Navbar/DesktopNav";
import MobileNav from "@/components/Navbar/MobileNav";
import "@/components/Navbar/Navbar.css";

const NavbarDynamic: FC = () => {
  const { data: session } = useSession();

  const isLoggedIn = !!session?.user.accessToken;

  return (
    <nav className="sticky top-0 w-full border-b bg-white dark:bg-background dark:border-border z-50">
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative flex items-center w-1/3">
          <div style={{ width: "120px", height: "46px", position: "relative" }}>
            <Image
              src="/images/logo2.svg"
              alt="Hoops Logo"
              fill
              className="brightness-0 dark:invert"
              priority
            />
          </div>
        </Link>

        {/* Desktop nav */}
        <DesktopNav isLoggedIn={isLoggedIn} session={session} />

        {/* Mobile nav */}
        <MobileNav isLoggedIn={isLoggedIn} session={session} />
      </div>

      {/* Hidden logout form for the server action */}
      <form id="logout-hidden-form" action={logoutAction} style={{ display: "none" }} />
    </nav>
  );
};

/**
 * The fallback is a "not logged in" navbar.
 * Next includes this HTML in the prerender,
 * then once the dynamic chunk is ready,
 * it will be replaced if the user is actually logged in.
 */
function NavbarFallback() {
  return (
    <nav className="sticky top-0 w-full border-b bg-white dark:bg-background dark:border-border z-50">
      <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="relative flex items-center w-1/3">
          <div style={{ width: "120px", height: "46px", position: "relative" }}>
            <Image
              src="/images/logo2.svg"
              alt="Hoops Logo"
              fill
              className="brightness-0 dark:invert"
              priority
            />
          </div>
        </Link>

        {/* "Logged out" Desktop nav */}
        <DesktopNav isLoggedIn={false} session={null} />

        {/* "Logged out" Mobile nav */}
        <MobileNav isLoggedIn={false} session={null} />
      </div>

      {/* Hidden logout form is still here, but won't do anything if user not logged in */}
      <form id="logout-hidden-form" action={logoutAction} style={{ display: "none" }} />
    </nav>
  );
}

/**
 * The exported component, wrapped in Suspense.
 * - Next prerenders the fallback if dynamic logic is detected at build time.
 * - On request, Next streams in the dynamic content (NavbarDynamic).
 */
const Navbar: FC = () => {
  return (
    <Suspense fallback={<NavbarFallback />}>
      <NavbarDynamic />
    </Suspense>
  );
};

export default Navbar;
