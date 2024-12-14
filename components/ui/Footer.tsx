import Link from "next/link";

export function Footer() {
  return (
    <footer 
      className="border-t border-border p-4" 
      style={{ display: 'var(--footer-display, block)' }}
    >
      <nav className="flex justify-center gap-6 text-sm text-muted-foreground">
        <Link href="#" className="hover:text-primary transition-colors duration-300">Pricing</Link>
        <Link href="#" className="hover:text-primary transition-colors duration-300">Enterprise</Link>
        <Link href="#" className="hover:text-primary transition-colors duration-300">FAQ</Link>
        <Link href="#" className="hover:text-primary transition-colors duration-300">Legal</Link>
        <Link href="#" className="hover:text-primary transition-colors duration-300">Privacy</Link>
        <Link href="#" className="hover:text-primary transition-colors duration-300">Explore</Link>
        <Link href="#" className="hover:text-primary transition-colors duration-300">Save ↗</Link>
      </nav>
    </footer>
  )
} 