import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";

interface BreadcrumbsProps {
  items: {
    label: string;
    href: string;
  }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link href="/" className="flex items-center hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center">
          <ChevronRight className="h-4 w-4" />
          <Link
            href={item.href}
            className={`ml-1 hover:text-foreground transition-colors ${index === items.length - 1 ? "text-foreground font-medium" : ""}`}
          >
            {item.label}
          </Link>
        </div>
      ))}
    </nav>
  );
}
