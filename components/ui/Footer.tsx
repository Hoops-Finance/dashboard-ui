export function Footer() {
  return (
    <footer 
      className="border-t border-border p-4" 
      style={{ display: 'var(--footer-display, block)' }}
    >
      <nav className="flex justify-center gap-6 text-sm text-muted-foreground">
        <a href="#" className="hover:text-primary transition-colors duration-300">Pricing</a>
        <a href="#" className="hover:text-primary transition-colors duration-300">Enterprise</a>
        <a href="#" className="hover:text-primary transition-colors duration-300">FAQ</a>
        <a href="#" className="hover:text-primary transition-colors duration-300">Legal</a>
        <a href="#" className="hover:text-primary transition-colors duration-300">Privacy</a>
        <a href="#" className="hover:text-primary transition-colors duration-300">Explore</a>
        <a href="#" className="hover:text-primary transition-colors duration-300">Save ↗</a>
      </nav>
    </footer>
  )
} 