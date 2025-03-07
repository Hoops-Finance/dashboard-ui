// @/components/Navbar/HighlightNavLink.tsx
"use client";
export const experimental_ppr = true;
import { usePathname } from "next/navigation";
import Link from "next/link";

interface Props {
  name: string;
  path: string;
  fallbackClassName: string;
  activeClassName: string;
  baseClassName?: string;
}

/**
 * This client component:
 * - Reads the current path from `usePathname()`.
 * - If `pathname === path`, it uses the `activeClassName`.
 * - Otherwise it uses the fallbackClassName.
 * The `baseClassName` can hold common classes for both states.
 */
export default function PathLink({
  name,
  path,
  fallbackClassName,
  activeClassName,
  baseClassName = "",
}: Props) {
  const pathname = usePathname();
  const isActive = pathname === path;
  const finalClass = isActive
    ? `${baseClassName} ${activeClassName}`
    : `${baseClassName} ${fallbackClassName}`;

  return (
    <Link href={path} className={finalClass}>
      {name}
    </Link>
  );
}
