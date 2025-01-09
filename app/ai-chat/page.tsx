"use client";

import { AIChat } from "@/components/Assistant/ai-chat";
import { StrategiesSidebar } from "@/components/Assistant/strategies-sidebar";
import { PageLayout } from "@/components/ui/PageLayout";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AIChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <PageLayout className="p-0">
      <div className="flex h-[calc(100vh-4rem)] relative">
        {/* Mobile Sidebar Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 lg:hidden z-50"
          onClick={() => {
            setSidebarOpen(!sidebarOpen);
          }}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>

        {/* Strategies Sidebar */}
        <aside
          className={cn(
            "w-[320px] border-r border-border bg-background",
            "fixed inset-y-0 left-0 z-40 lg:static",
            "transition-transform duration-200 ease-in-out",
            "lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full",
            "lg:block",
            sidebarOpen ? "block" : "hidden"
          )}
        >
          <div className="flex flex-col h-full">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-foreground">Strategies</h2>
              <p className="text-sm text-muted-foreground">Your automated DeFi investment plans</p>
            </div>
            <div className="flex-1 overflow-hidden px-4">
              <StrategiesSidebar />
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0">
          <header className="border-b border-border px-6 py-4">
            <div className="ml-12 lg:ml-0">
              <h1 className="text-xl font-semibold text-foreground">Chat with Hoops AI</h1>
              <p className="text-sm text-muted-foreground">Get insights and optimize your DeFi strategies</p>
            </div>
          </header>
          <div className="flex-1 overflow-hidden">
            <AIChat />
          </div>
        </main>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => {
              setSidebarOpen(false);
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </PageLayout>
  );
}
