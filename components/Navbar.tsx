"use server";

import { FC } from "react";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/utils/auth";
import { logoutAction } from "@/actions/logout";
import DesktopNav from "@/components/Navbar/DesktopNav";
import MobileNav from "@/components/Navbar/MobileNav";
import "@/components/Navbar/Navbar.css";

/**
 * The main exported server component. 
 * We fetch session, then we render a single <Navbar> with 
 * DesktopNav + MobileNav, all server-side except subcomponent UserMenu.
 */

const Navbar: FC = async () => {
  const session = await auth(); // fetch session
  const isLoggedIn = !!session?.user?.accessToken;

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
        <MobileNav
          isLoggedIn={isLoggedIn}
          session={session}
        />
      </div>

      {/* Hidden logout form for the server action */}
      <form id="logout-hidden-form" action={logoutAction} style={{ display: "none" }} />
    </nav>
  );
};

export default Navbar;
