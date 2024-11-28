interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({ children, className = "" }: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className={`flex-1 flex flex-col p-8 pt-28 max-w-screen-2xl mx-auto w-full ${className}`}>
        {children}
      </main>
    </div>
  );
} 