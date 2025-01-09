"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";

export function TabNavigation() {
  const [activeTab, setActiveTab] = useState<"all" | "stablecoins">("all");

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={activeTab === "all" ? "default" : "secondary"}
        className="h-9"
        onClick={() => {
          setActiveTab("all");
        }}
      >
        All Pools
      </Button>
      <Button
        variant={activeTab === "stablecoins" ? "default" : "secondary"}
        className="h-9 capitalize group"
        onClick={() => {
          setActiveTab("stablecoins");
        }}
      >
        Stablecoins
      </Button>
    </div>
  );
}
